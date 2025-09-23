#!/bin/bash

# Test upload với authentication
echo "Testing upload endpoint..."

# Tạo file test nhỏ
echo "test image content" > test-image.txt

# Test upload với curl
curl -X POST http://localhost:8080/api/images/upload-poster \
  -F "file=@test-image.txt" \
  -F "movieTitle=test-movie" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -v

# Cleanup
rm test-image.txt
