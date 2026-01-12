import { useState, useCallback, useRef, useEffect } from 'react'

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const utteranceRef = useRef(null)

  useEffect(() => {
    setIsSupported('speechSynthesis' in window)
    
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = useCallback((text, options = {}) => {
    if (!isSupported) {
      console.warn('TTS not supported')
      return
    }

    // Arrêter toute lecture en cours
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    // Configuration par défaut
    utterance.rate = options.rate || 0.9
    utterance.pitch = options.pitch || 1.0
    utterance.volume = options.volume || 1.0

    // Sélection de la voix française si disponible
    const voices = window.speechSynthesis.getVoices()
    const frenchVoice = voices.find(voice => 
      voice.lang.startsWith('fr') || voice.name.includes('French')
    )
    
    if (frenchVoice) {
      utterance.voice = frenchVoice
    }

    // Événements
    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      if (options.onEnd) {
        options.onEnd()
      }
    }

    utterance.onerror = (event) => {
      console.error('TTS Error:', event.error)
      setIsSpeaking(false)
      if (options.onError) {
        options.onError(event)
      }
    }

    // Démarrer la lecture
    window.speechSynthesis.speak(utterance)
  }, [isSupported])

  const stopSpeaking = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  const pauseSpeaking = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause()
    }
  }, [isSupported, isSpeaking])

  const resumeSpeaking = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.resume()
    }
  }, [isSupported])

  return {
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    isSpeaking,
    isSupported
  }
}