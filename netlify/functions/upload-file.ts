import type { Handler } from '@netlify/functions';
import * as fs from 'fs';
import * as path from 'path';

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      } as Record<string, string>,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse multipart form data
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    const boundary = boundaryMatch ? boundaryMatch[1].trim() : null;
    
    if (!boundary) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'No boundary found in Content-Type header' }),
      };
    }

    // Parse the body - keep as Buffer to preserve binary data
    // Netlify Functions sends binary data as base64-encoded strings
    let bodyBuffer: Buffer;
    if (event.isBase64Encoded) {
      bodyBuffer = Buffer.from(event.body || '', 'base64');
    } else {
      // If not base64, the body might be a string representation
      // In that case, we need to handle it as binary data
      if (typeof event.body === 'string') {
        bodyBuffer = Buffer.from(event.body, 'binary');
      } else {
        bodyBuffer = Buffer.from(event.body || '', 'binary');
      }
    }
    
    // Convert boundary to Buffer for searching
    const boundaryBuffer = Buffer.from(`--${boundary}`, 'utf8');
    
    let fileData: Buffer | null = null;
    let fileName = '';
    let fileType = '';

    // Find all boundary positions (including leading/trailing)
    const boundaryPositions: number[] = [];
    let searchPos = 0;
    while (searchPos < bodyBuffer.length) {
      const pos = bodyBuffer.indexOf(boundaryBuffer, searchPos);
      if (pos === -1) break;
      boundaryPositions.push(pos);
      searchPos = pos + boundaryBuffer.length;
    }

    // Need at least 2 boundaries (start and end)
    if (boundaryPositions.length < 2) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid multipart form data format' }),
      };
    }

    // Process each part between boundaries
    // Skip the first boundary (it's just the start marker)
    for (let i = 0; i < boundaryPositions.length - 1; i++) {
      const partStart = boundaryPositions[i] + boundaryBuffer.length;
      const partEnd = boundaryPositions[i + 1];
      
      // Skip leading \r\n after boundary if present
      let actualStart = partStart;
      if (bodyBuffer[actualStart] === 0x0D && bodyBuffer[actualStart + 1] === 0x0A) {
        actualStart += 2;
      } else if (bodyBuffer[actualStart] === 0x0A) {
        actualStart += 1;
      }
      
      const partBuffer = bodyBuffer.slice(actualStart, partEnd);

      // Find header section (ends with \r\n\r\n)
      const headerEndSeq = Buffer.from('\r\n\r\n', 'utf8');
      const headerEndIndex = partBuffer.indexOf(headerEndSeq);
      
      if (headerEndIndex === -1) continue;

      // Extract headers as string for parsing
      const headerBuffer = partBuffer.slice(0, headerEndIndex);
      const headers = headerBuffer.toString('utf8');

      // Check if this part contains a file
      const filenameMatch = headers.match(/filename="([^"]+)"/);
      const nameMatch = headers.match(/name="([^"]+)"/);
      const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);

      if (filenameMatch && nameMatch?.[1] === 'file') {
        fileName = filenameMatch[1];
        fileType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';

        // Extract file content as Buffer (after headers, before next boundary)
        const contentStart = headerEndIndex + headerEndSeq.length;
        let contentEnd = partBuffer.length;

        // Remove trailing \r\n if present
        if (contentEnd >= 2 && 
            partBuffer[contentEnd - 2] === 0x0D && 
            partBuffer[contentEnd - 1] === 0x0A) {
          contentEnd -= 2;
        }

        // Extract file data directly as Buffer - this preserves binary integrity
        fileData = partBuffer.slice(contentStart, contentEnd);
        break; // Found the file, no need to continue
      }
    }

    if (!fileData || !fileName) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'No file found in request' }),
      };
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileExt = path.extname(fileName);
    const baseName = path.basename(fileName, fileExt).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueFileName = `${timestamp}-${randomId}-${baseName}${fileExt}`;

    // Create enterprisefiles directory in public if it doesn't exist
    // Note: In Netlify production, we can't write to public directly
    // This will work in local development
    // For production, consider using Netlify Blobs or another storage solution
    const publicDir = path.join(process.cwd(), 'public', 'enterprisefiles');
    
    // In Netlify production, use /tmp for temporary storage
    // But files won't persist - this is a limitation
    const uploadDir = process.env.NETLIFY ? 
      path.join('/tmp', 'enterprisefiles') : 
      publicDir;

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write file
    const filePath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(filePath, fileData);

    // Return relative path from public directory
    // In production on Netlify, you'll need to serve files differently
    // For now, return a path that will be served statically if files are in public
    const relativePath = `/enterprisefiles/${uniqueFileName}`;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        path: relativePath,
        fileName: uniqueFileName,
        originalFileName: fileName,
      }),
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};

