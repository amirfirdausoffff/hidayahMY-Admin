export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'password';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = Buffer.from(`${Date.now()}-${ADMIN_USER}-hidayahmy`).toString('base64');
    return res.status(200).json({ success: true, token });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
}
