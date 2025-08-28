import React, { useState } from 'react'

const ImageUpload = ({ onImagesChange, currentImages = [] }) => {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState(currentImages)

  // Cloudinary configuration - you'll need to set these in your .env
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    const uploadedUrls = []

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        )

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        uploadedUrls.push(data.secure_url)
      }

      const newImages = [...images, ...uploadedUrls]
      setImages(newImages)
      onImagesChange(newImages)
    } catch {
      // console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  const reorderImages = (fromIndex, toIndex) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setImages(newImages)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="block text-sm font-medium text-gray-700">
          Product Images
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
        />
      </div>

      {uploading && (
        <div className="text-sm text-gray-600">Uploading images...</div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => reorderImages(index, index - 1)}
                  className="absolute top-1 left-1 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700 transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              )}
              {index < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => reorderImages(index, index + 1)}
                  className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700 transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500">
        Drag and drop images or click to select. First image will be the main product image.
      </div>
    </div>
  )
}

export default ImageUpload
