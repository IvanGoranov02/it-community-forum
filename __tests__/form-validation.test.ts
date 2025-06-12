// Form validation utility functions test
describe('Form Validation', () => {
  it('should validate password strength', () => {
    const isStrongPassword = (password: string) => {
      return password.length >= 8 && 
             /[A-Z]/.test(password) && 
             /[a-z]/.test(password) && 
             /[0-9]/.test(password)
    }

    expect(isStrongPassword('Password123')).toBe(true)
    expect(isStrongPassword('StrongPass1')).toBe(true)
    expect(isStrongPassword('weak')).toBe(false)
    expect(isStrongPassword('password123')).toBe(false) // no uppercase
    expect(isStrongPassword('PASSWORD123')).toBe(false) // no lowercase
    expect(isStrongPassword('Password')).toBe(false) // no number
  })

  it('should sanitize username input', () => {
    const sanitizeUsername = (username: string) => {
      return username.toLowerCase()
                    .replace(/[^a-z0-9]/g, '')
                    .substring(0, 20)
    }

    expect(sanitizeUsername('TestUser123')).toBe('testuser123')
    expect(sanitizeUsername('user@name.com')).toBe('usernamecom')
    expect(sanitizeUsername('User With Spaces')).toBe('userwithspaces')
    expect(sanitizeUsername('VeryLongUsernameExceedingLimit')).toBe('verylongusernameexce')
  })

  it('should validate post title length', () => {
    const isValidTitle = (title: string) => {
      const trimmed = title.trim()
      return trimmed.length >= 5 && trimmed.length <= 200
    }

    expect(isValidTitle('Valid Title')).toBe(true)
    expect(isValidTitle('Hi')).toBe(false) // too short
    expect(isValidTitle('   Valid Title   ')).toBe(true) // should trim
    expect(isValidTitle('A'.repeat(201))).toBe(false) // too long
    expect(isValidTitle('A'.repeat(200))).toBe(true) // exactly 200 chars
  })
}) 