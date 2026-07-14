export interface GalleryItem {
  id: string
  asset_url: string
  type: 'image' | 'video'
  title?: string
  description?: string
}

export const finalProducts: GalleryItem[] = [
  { id: 'fp1', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/gallery/Gallery/1774621465753-BOUCLE%203D%20VIDEO.mp4', type: 'video' },
  { id: 'fp2', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/Gallery/Other/compressed_teak%20age%20video.mp4', type: 'video' },
  { id: 'fp3', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/gallery/Gallery/1774621503852-COMPLETED%20PROJECT.mp4', type: 'video' },
  { id: 'fp4', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/gallery/Gallery/1774621483840-PRINTED%20FABRIC%20VIDEO.mp4', type: 'video' },
]

export const inaugurations: GalleryItem[] = [
  { id: 'in1', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/gallery/Gallery/1774621478129-KFK%20NILAMBUR.mp4', type: 'video' },
  { id: 'in2', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/Gallery/Other/ex2.mp4', type: 'video' },
  { id: 'in3', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/Gallery/Other/ex1.mp4', type: 'video' },
  { id: 'in4', asset_url: 'https://kairafabrics.s3.ap-south-1.amazonaws.com/Gallery/Other/ex3.mp4', type: 'video' },
]

export const getVideoThumbnail = (videoUrl: string): string => {
  const fileName = videoUrl.split('/').pop()?.replace(/\.[^.]+$/, '') ?? ''
  return `https://kairafabrics.s3.ap-south-1.amazonaws.com/thumbnails/Other/${fileName}.webp`
}
