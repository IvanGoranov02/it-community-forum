// Simple utility functions test
describe('Utility Functions', () => {
  it('should handle URL hash parsing', () => {
    const hash = '#access_token=abc123&refresh_token=def456&token_type=bearer'
    const params = new URLSearchParams(hash.substring(1))
    
    expect(params.get('access_token')).toBe('abc123')
    expect(params.get('refresh_token')).toBe('def456')
    expect(params.get('token_type')).toBe('bearer')
  })

  it('should generate username from email', () => {
    const generateUsername = (email: string) => {
      const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")
      return baseUsername + Math.floor(Math.random() * 1000)
    }

    const username = generateUsername('test.user@example.com')
    expect(username).toMatch(/^testuser\d{1,3}$/)
  })

  it('should handle OAuth error messages', () => {
    const errorDescription = 'Multiple%20accounts%20with%20the%20same%20email'
    const decoded = decodeURIComponent(errorDescription.replace(/\+/g, ' '))
    
    expect(decoded).toBe('Multiple accounts with the same email')
  })
}) 