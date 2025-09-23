// Debug script để test upload
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function testUpload() {
  try {
    // Tạo file test
    fs.writeFileSync("test-image.jpg", "fake image content");

    // Login để lấy token
    const loginResponse = await axios.post(
      "http://localhost:8080/api/auth/login",
      {
        username: "admin", // Thay bằng username thực tế
        password: "admin", // Thay bằng password thực tế
      }
    );

    const token = loginResponse.data.access_token;
    console.log("Login successful, token:", token.substring(0, 20) + "...");

    // Test upload
    const formData = new FormData();
    formData.append("file", fs.createReadStream("test-image.jpg"));
    formData.append("movieTitle", "test-movie");

    const uploadResponse = await axios.post(
      "http://localhost:8080/api/images/upload-poster",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Upload successful:", uploadResponse.data);

    // Cleanup
    fs.unlinkSync("test-image.jpg");
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

testUpload();
