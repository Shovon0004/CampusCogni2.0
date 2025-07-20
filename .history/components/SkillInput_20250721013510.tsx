"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'

interface SkillInputProps {
  onAddSkill: (skill: string, experience: number) => void
  placeholder?: string
}

export function SkillInput({ onAddSkill, placeholder = "Skill name (e.g., React, Python, AWS)" }: SkillInputProps) {
  const [skillInput, setSkillInput] = useState("")
  const [experienceInput, setExperienceInput] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (skillInput.length >= 2) {
        try {
          const response = await fetch(`/api/skills/suggestions?q=${encodeURIComponent(skillInput)}`)
          const data = await response.json()
          setSuggestions(data.suggestions || [])
          setShowSuggestions(true)
          setSelectedIndex(-1)
        } catch (error) {
          console.error("Error fetching suggestions:", error)
          setSuggestions([])
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [skillInput])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault()
        handleAddSkill()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex])
        } else {
          handleAddSkill()
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const selectSuggestion = (skill: string) => {
    setSkillInput(skill)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    // Focus on experience input
    const experienceInput = document.querySelector('input[placeholder="Years"]') as HTMLInputElement
    if (experienceInput) {
      experienceInput.focus()
    }
  }

  const handleAddSkill = () => {
    const skill = skillInput.trim()
    const experience = parseInt(experienceInput)
    
    if (skill && experience > 0) {
      onAddSkill(skill, experience)
      setSkillInput("")
      setExperienceInput("")
      setShowSuggestions(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => skillInput.length >= 2 && setShowSuggestions(true)}
            onBlur={() => {
              // Delay hiding suggestions to allow clicking
              setTimeout(() => setShowSuggestions(false), 200)
            }}
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                    index === selectedIndex ? "bg-blue-50 text-blue-600" : ""
                  }`}
                  onClick={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Input
          type="number"
          placeholder="Years"
          value={experienceInput}
          onChange={(e) => setExperienceInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
          className="w-24"
          min="0"
          max="50"
        />
        
        <Button onClick={handleAddSkill} size="sm" type="button">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
