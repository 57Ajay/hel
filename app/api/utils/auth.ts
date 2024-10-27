export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new Uint8Array([...salt, ...msgBuffer])
  );

  const saltString = Buffer.from(salt).toString('base64');
  const hashString = Buffer.from(new Uint8Array(hashBuffer)).toString('base64');

  return `${saltString}.${hashString}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [storedSalt, hash] = storedHash.split('.');

    const salt = new Uint8Array(Buffer.from(storedSalt, 'base64'));

    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new Uint8Array([...salt, ...msgBuffer])
    );

    const newHash = Buffer.from(new Uint8Array(hashBuffer)).toString('base64');

    return newHash === hash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

export function checkPasswordStrength(password: string): {
  isStrong: boolean;
  requirements: string[];
} {
  const requirements: string[] = [];

  if (password.length < 8) {
    requirements.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    requirements.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    requirements.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    requirements.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    requirements.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isStrong: requirements.length === 0,
    requirements
  };
}
