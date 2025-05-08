import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

// Initialize cache with TTL of 1 day (in seconds) and check period of 10 minutes
const imageCache = new NodeCache({ stdTTL: 86400, checkperiod: 600 });

const router = express.Router();

// Image proxy endpoint to serve Google Drive images
router.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }
    
    // Create a cache key from the URL
    const cacheKey = `image_${Buffer.from(url).toString('base64')}`;
    
    // Check if image is in cache
    const cachedImage = imageCache.get(cacheKey);
    if (cachedImage) {
      console.log(`Cache hit for image: ${url}`);
      
      // Set content type based on file extension or cached content type
      res.set('Content-Type', cachedImage.contentType);
      res.set('Cache-Control', 'public, max-age=86400'); // Cache for one day
      res.set('X-Cache', 'HIT');
      
      // Return cached image data
      return res.send(cachedImage.data);
    }
    
    console.log(`Cache miss for image: ${url}`);
    
    // Fetch the image 
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer', // Changed to arraybuffer to store in cache
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Store in cache
    const contentType = response.headers['content-type'];
    imageCache.set(cacheKey, {
      data: response.data,
      contentType: contentType
    });
    
    // Set appropriate headers
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for one day
    res.set('X-Cache', 'MISS');
    
    // Send the image data
    res.send(response.data);
  } catch (error) {
    console.error('Image proxy error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image'
    });
  }
});

// Route to clear the cache (protected, admin only)
router.post('/clear-cache', (req, res) => {
  const stats = imageCache.getStats();
  imageCache.flushAll();
  res.json({
    success: true,
    message: 'Cache cleared successfully',
    previousStats: stats
  });
});

export default router; 