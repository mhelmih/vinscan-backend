const { initializeFirebaseAdmin } = require('../firebase');

const isAuthenticated = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Unauthorized: No token provided' });
  }
  const token = header.split('Bearer ')[1];

  try {
    const adminApp = await initializeFirebaseAdmin();
    const decodedToken = await adminApp.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error(error);
    if (error.code === 'auth/id-token-expired') {
      res
        .status(401)
        .send({ message: 'Unauthorized: Token expired', tokenExpired: true });
    } else {
      res.status(500).send({ message: 'Internal server error' });
    }
  }
};

module.exports = { isAuthenticated };
