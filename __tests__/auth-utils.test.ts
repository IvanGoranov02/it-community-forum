// Authentication utility functions test
describe('Authentication Utils', () => {
  it('should validate email format', () => {
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
    expect(isValidEmail('test@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
  })

  it('should create session storage object', () => {
    const createStorageSession = (session: any) => {
      return {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: {
          id: session.user?.id,
          email: session.user?.email
        }
      }
    }

    const mockSession = {
      access_token: 'abc123',
      refresh_token: 'def456',
      expires_at: 1234567890,
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      }
    }

    const storageSession = createStorageSession(mockSession)
    
    expect(storageSession.access_token).toBe('abc123')
    expect(storageSession.refresh_token).toBe('def456')
    expect(storageSession.user.id).toBe('user-123')
    expect(storageSession.user.email).toBe('test@example.com')
    // Should not include extra user properties
    expect(storageSession.user).not.toHaveProperty('name')
  })

  it('should handle OAuth provider detection', () => {
    const detectOAuthProvider = (userMetadata: any) => {
      if (userMetadata?.iss?.includes('google')) return 'google'
      if (userMetadata?.iss?.includes('github')) return 'github'
      return 'unknown'
    }

    expect(detectOAuthProvider({ iss: 'https://accounts.google.com' })).toBe('google')
    expect(detectOAuthProvider({ iss: 'https://github.com/login/oauth' })).toBe('github')
    expect(detectOAuthProvider({ iss: 'https://other-provider.com' })).toBe('unknown')
    expect(detectOAuthProvider({})).toBe('unknown')
  })
}) 