const jwt = require('jsonwebtoken');

// Middleware d'authentification
const authMiddleware = (req, res, next) => {
  // Récupérer le token depuis l'en-tête Authorization
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // Vérifier si le token est absent
  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé, aucun token trouvé' });
  }

  try {
    // Décoder le token pour récupérer l'utilisateur
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que le token contient l'ID utilisateur et le stocker dans req.user
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Token invalide, utilisateur non trouvé' });
    }
    req.user = decoded; // req.user.id contiendra l'ID de l'utilisateur
    console.log('Decoded user from token:', req.user);
    next();
  } catch (err) {
    console.error("Erreur de token:", err);
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

// Middleware pour vérifier si l'utilisateur est administrateur
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // L'utilisateur est admin, passer à la suite
  } else {
    res.status(403).json({ message: 'Accès interdit, vous devez être un administrateur.' });
  }
};




module.exports = authMiddleware;