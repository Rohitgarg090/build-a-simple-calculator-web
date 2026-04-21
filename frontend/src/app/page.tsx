'use client'

import { useState, useEffect, useCallback } from 'react'
import { Delete, Clock, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react'

const COLORS = {
  primary: '#6366f1',
  background: '#0f0f13',
  surface: '#1c1c24',
  text: '#f1f1f5',
  accent: '#f59e0b',
  border: '#2e2e3d',
}

export default function Page() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [justCalculated, setJustCalculated] = useState(false)
  const [error, setError] = useState(false)
  const [memoryValue, setMemoryValue] = useState(null)
  const [showMemoryIndicator, setShowMemoryIndicator] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('calc_history')
    if (saved) {
      try { setHistory(JSON.parse(saved)) } catch {}
    }
    const mem = localStorage.getItem('calc_memory')
    if (mem) {
      setMemoryValue(parseFloat(mem))
      setShowMemoryIndicator(true)
    }
  }, [])

  const saveHistory = (newHistory) => {
    localStorage.setItem('calc_history', JSON.stringify(newHistory))
    setHistory(newHistory)
  }

  const handleDigit = useCallback((digit) => {
    setError(false)
    if (justCalculated) {
      setDisplay(digit === '.' ? '0.' : digit)
      setExpression('')
      setJustCalculated(false)
      return
    }
    setDisplay(prev => {
      if (digit === '.') {
        if (prev.includes('.')) return prev
        return prev + '.'
      }
      if (prev === '0' && digit !== '.') return digit
      if (prev.length >= 15) return prev
      return prev + digit
    })
  }, [justCalculated])

  const handleOperator = useCallback((op) => {
    setError(false)
    setJustCalculated(false)
    const current = parseFloat(display)
    if (justCalculated) {
      setExpression(display + ' ' + op)
      return
    }
    setExpression(prev => {
      if (prev === '') return display + ' ' + op
      const parts = prev.trim().split(' ')
      const lastPart = parts[parts.length - 1]
      if (['+', '-', '×', '÷', '%'].includes(lastPart)) {
        parts[parts.length - 1] = op
        return parts.join(' ')
      }
      return prev + ' ' + display + ' ' + op
    })
    setDisplay('0')
    setJustCalculated(false)
  }, [display, justCalculated])

  const calculate = useCallback(() => {
    if (expression === '' && !justCalculated) return
    setError(false)
    try {
      const fullExpr = expression + ' ' + display
      const parts = fullExpr.trim().split(' ').filter(Boolean)
      
      let nums = []
      let ops = []
      
      for (let p of parts) {
        if (['+', '-', '×', '÷', '%'].includes(p)) {
          ops.push(p)
        } else {
          nums.push(parseFloat(p))
        }
      }

      if (nums.length === 0) return
      if (ops.length === 0) return

      // Handle precedence: first % and ÷ and ×, then + and -
      // Flatten into single pass with precedence
      let values = [...nums]
      let operators = [...ops]

      // First pass: × ÷ %
      let i = 0
      while (i < operators.length) {
        if (operators[i] === '×' || operators[i] === '÷' || operators[i] === '%') {
          let result
          if (operators[i] === '×') result = values[i] * values[i + 1]
          else if (operators[i] === '÷') {
            if (values[i + 1] === 0) throw new Error('Division by zero')
            result = values[i] / values[i + 1]
          } else result = values[i] % values[i + 1]
          values.splice(i, 2, result)
          operators.splice(i, 1)
        } else i++
      }

      // Second pass: + -
      let total = values[0]
      for (let j = 0; j < operators.length; j++) {
        if (operators[j] === '+') total += values[j + 1]
        else if (operators[j] === '-') total -= values[j + 1]
      }

      const resultStr = Number.isFinite(total)
        ? (Math.round(total * 1e10) / 1e10).toString()
        : (() => { throw new Error('Invalid') })()

      const historyEntry = {
        id: Date.now(),
        expression: fullExpr.trim(),
        result: resultStr,
        timestamp: new Date().toLocaleString(),
      }
      const newHistory = [historyEntry, ...history].slice(0, 50)
      saveHistory(newHistory)

      setDisplay(resultStr)
      setExpression(fullExpr.trim() + ' =')
      setJustCalculated(true)
    } catch (e) {
      setDisplay('Error')
      setError(true)
      setExpression('')
      setJustCalculated(true)
    }
  }, [display, expression, history, justCalculated])

  const handleClear = () => {
    setDisplay('0')
    setExpression('')
    setJustCalculated(false)
    setError(false)
  }

  const handleBackspace = () => {
    if (justCalculated || error) {
      setDisplay('0')
      setExpression('')
      setJustCalculated(false)
      setError(false)
      return
    }
    setDisplay(prev => prev.length <= 1 ? '0' : prev.slice(0, -1))
  }

  const handleToggleSign = () => {
    if (display === '0' || error) return
    setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev)
  }

  const handlePercent = () => {
    if (error) return
    const val = parseFloat(display) / 100
    setDisplay((Math.round(val * 1e10) / 1e10).toString())
  }

  const handleMemoryStore = () => {
    const val = parseFloat(display)
    if (!isNaN(val)) {
      setMemoryValue(val)
      localStorage.setItem('calc_memory', val.toString())
      setShowMemoryIndicator(true)
    }
  }

  const handleMemoryRecall = () => {
    if (memoryValue !== null) {
      setDisplay(memoryValue.toString())
      setJustCalculated(false)
    }
  }

  const handleMemoryClear = () => {
    setMemoryValue(null)
    localStorage.removeItem('calc_memory')
    setShowMemoryIndicator(false)
  }

  const handleMemoryAdd = () => {
    const val = parseFloat(display)
    if (!isNaN(val)) {
      const newVal = (memoryValue || 0) + val
      setMemoryValue(newVal)
      localStorage.setItem('calc_memory', newVal.toString())
      setShowMemoryIndicator(true)
    }
  }

  const deleteHistoryItem = (id) => {
    const updated = history.filter(h => h.id !== id)
    saveHistory(updated)
  }

  const clearAllHistory = () => {
    saveHistory([])
  }

  const useHistoryResult = (item) => {
    setDisplay(item.result)
    setExpression('')
    setJustCalculated(true)
    setError(false)
  }

  useEffect(() => {
    const handler = (e) => {
      const k = e.key
      if (k >= '0' && k <= '9') handleDigit(k)
      else if (k === '.') handleDigit('.')
      else if (k === '+') handleOperator('+')
      else if (k === '-') handleOperator('-')
      else if (k === '*') handleOperator('×')
      else if (k === '/') { e.preventDefault(); handleOperator('÷') }
      else if (k === '%') handleOperator('%')
      else if (k === 'Enter' || k === '=') calculate()
      else if (k === 'Backspace') handleBackspace()
      else if (k === 'Escape') handleClear()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleDigit, handleOperator, calculate, handleBackspace])

  const btnStyle = (variant = 'default') => ({
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.15rem',
    fontWeight: '600',
    transition: 'all 0.12s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    aspectRatio: '1',
    width: '100%',
    ...(variant === 'default' && {
      background: '#252530',
      color: COLORS.text,
    }),
    ...(variant === 'operator' && {
      background: `${COLORS.primary}22`,
      color: COLORS.primary,
      border: `1px solid ${COLORS.primary}44`,
    }),
    ...(variant === 'equal' && {
      background: `linear-gradient(135deg, ${COLORS.primary}, #818cf8)`,
      color: '#fff',
      boxShadow: `0 4px 20px ${COLORS.primary}55`,
    }),
    ...(variant === 'clear' && {
      background: `#ff444422`,
      color: '#ff6666',
      border: `1px solid #ff444433`,
    }),
    ...(variant === 'function' && {
      background: '#252530',
      color: COLORS.accent,
      fontSize: '0.95rem',
    }),
    ...(variant === 'memory' && {
      background: '#252530',
      color: '#a78bfa',
      fontSize: '0.78rem',
      fontWeight: '700',
    }),
  })

  const displayLength = display.length
  const displayFontSize = displayLength > 12 ? '1.6rem' : displayLength > 9 ? '2rem' : displayLength > 6 ? '2.6rem' : '3rem'

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: '20px',
      color: COLORS.text,
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: COLORS.text, margin: 0, letterSpacing: '-0.5px' }}>
          ⟨ <span style={{ color: COLORS.primary }}>Calc</span>Forge ⟩
        </h1>
        <p style={{ fontSize: '0.75rem', color: '#6b6b80', margin: '4px 0 0', letterSpacing: '0.05em' }}>PRECISION CALCULATOR</p>
      </div>

      {/* Main Calculator */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: COLORS.surface,
        borderRadius: '24px',
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        {/* Display */}
        <div style={{
          padding: '24px 24px 16px',
          background: '#14141c',
          borderBottom: `1px solid ${COLORS.border}`,
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          {/* Expression */}
          <div style={{
            fontSize: '0.85rem',
            color: '#6b6b80',
            textAlign: 'right',
            minHeight: '22px',
            wordBreak: 'break-all',
            marginBottom: '8px',
            fontWeight: '500',
          }}>
            {expression || '\u00A0'}
          </div>
          {/* Main display */}
          <div style={{
            fontSize: displayFontSize,
            fontWeight: '700',
            textAlign: 'right',
            color: error ? '#ff6666' : justCalculated ? COLORS.accent : COLORS.text,
            transition: 'color 0.2s',
            wordBreak: 'break-all',
            lineHeight: '1.1',
            letterSpacing: '-1px',
          }}>
            {display}
          </div>
          {/* Memory indicator */}
          {showMemoryIndicator && (
            <div style={{
              fontSize: '0.7rem',
              color: '#a78bfa',
              textAlign: 'left',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span style={{
                background: '#a78bfa33',
                border: '1px solid #a78bfa44',
                borderRadius: '4px',
                padding: '1px 5px',
                fontWeight: '700',
              }}>M</span>
              <span style={{ color: '#6b6b80' }}>{memoryValue}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Memory row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {[
              { label: 'MC', action: handleMemoryClear, variant: 'memory' },
              { label: 'MR', action: handleMemoryRecall, variant: 'memory' },
              { label: 'M+', action: handleMemoryAdd, variant: 'memory' },
              { label: 'MS', action: handleMemoryStore, variant: 'memory' },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.action}
                style={{ ...btnStyle(btn.variant), aspectRatio: 'unset', padding: '10px 0', fontSize: '0.75rem' }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Row 1: AC, +/-, %, ÷ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {[
              { label: 'AC', action: handleClear, variant: 'clear' },
              { label: '+/-', action: handleToggleSign, variant: 'function' },
              { label: '%', action: handlePercent, variant: 'function' },
              { label: '÷', action: () => handleOperator('÷'), variant: 'operator' },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.action}
                style={btnStyle(btn.variant)}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Row 2: 7, 8, 9, × */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {[
              { label: '7', action: () => handleDigit('7'), variant: 'default' },
              { label: '8', action: () => handleDigit('8'), variant: 'default' },
              { label: '9', action: () => handleDigit('9'), variant: 'default' },
              { label: '×', action: () => handleOperator('×'), variant: 'operator' },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action} style={btnStyle(btn.variant)}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                {btn.label}
              </button>
            ))}
          </div>

          {/* Row 3: 4, 5, 6, - */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {[
              { label: '4', action: () => handleDigit('4'), variant: 'default' },
              { label: '5', action: () => handleDigit('5'), variant: 'default' },
              { label: '6', action: () => handleDigit('6'), variant: 'default' },
              { label: '-', action: () => handleOperator('-'), variant: 'operator' },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action} style={btnStyle(btn.variant)}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                {btn.label}
              </button>
            ))}
          </div>

          {/* Row 4: 1, 2, 3, + */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {[
              { label: '1', action: () => handleDigit('1'), variant: 'default' },
              { label: '2', action: () => handleDigit('2'), variant: 'default' },
              { label: '3', action: () => handleDigit('3'), variant: 'default' },
              { label: '+', action: () => handleOperator('+'), variant: 'operator' },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action} style={btnStyle(btn.variant)}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                {btn.label}
              </button>
            ))}
          </div>

          {/* Row 5: 0 (wide), ., backspace, = */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <button
              onClick={() => handleDigit('0')}
              style={{ ...btnStyle('default'), gridColumn: 'span 1' }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
            >0</button>
            <button
              onClick={() => handleDigit('.')}
              style={btnStyle('default')}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
            >.</button>
            <button
              onClick={handleBackspace}
              style={btnStyle('function')}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.3)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
            >
              <Delete size={18} />
            </button>
            <button
              onClick={calculate}
              style={btnStyle('equal')}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'scale(1.04)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)' }}
            >=</button>
          </div>
        </div>
      </div>

      {/* History Toggle */}
      <div style={{ width: '100%', maxWidth: '380px', marginTop: '16px' }}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            width: '100%',
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '14px',
            padding: '12px 20px',
            color: COLORS.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.primary}
          onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color={COLORS.primary} />
            <span>Calculation History</span>
            {history.length > 0 && (
              <span style={{
                background: `${COLORS.primary}33`,
                color: COLORS.primary,
                borderRadius: '20px',
                padding: '1px 8px',
                fontSize: '0.75rem',
                fontWeight: '700',
              }}>{history.length}</span>
            )}
          </div>
          {showHistory ? <ChevronUp size={16} color="#6b6b80" /> : <ChevronDown size={16} color="#6b6b80" />}
        </button>

        {/* History Panel */}
        {showHistory && (
          <div style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '14px',
            marginTop: '8px',
            overflow: 'hidden',
          }}>
            {history.length === 0 ? (
              <div style={{
                padding: '32px',
                textAlign: 'center',
                color: '#6b6b80',
                fontSize: '0.9rem',
              }}>
                <Clock size={32} color="#2e2e3d" style={{ marginBottom: '8px' }} />
                <div>No calculations yet</div>
              </div>
            ) : (
              <>
                <div style={{
                  padding: '10px 16px',
                  borderBottom: `1px solid ${COLORS.border}`,
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}>
                  <button
                    onClick={clearAllHistory}
                    style={{
                      background: 'none',
                      border: '1px solid #ff444433',
                      color: '#ff6666',
                      borderRadius: '8px',
                      padding: '4px 12px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: '600',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ff444422'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Trash2 size={12} /> Clear All
                  </button>
                </div>
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {history.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: idx < history.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#252530'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => useHistoryResult(item)}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#6b6b80',
                          marginBottom: '3px',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}>
                          {item.expression}
                        </div>
                        <div style={{
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: COLORS.accent,
                        }}>
                          = {item.result}
                        </div>
                        <div style={{
                          fontSize: '0.7rem',
                          color: '#3e3e50',
                          marginTop: '2px',
                        }}>
                          {item.timestamp}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id) }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3e3e50',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '8px',
                          marginLeft: '8px',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ff6666'; e.currentTarget.style.background = '#ff444422' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#3e3e50'; e.currentTarget.style.background = 'none' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div style={{
        marginTop: '16px',
        fontSize: '0.7rem',
        color: '#3e3e50',
        textAlign: 'center',
        letterSpacing: '0.03em',
      }}>
        Keyboard supported · Click history to reuse · Memory persists across sessions
      </div>
    </div>
  )
}