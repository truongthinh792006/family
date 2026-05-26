/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Album, Photo } from '../types';

/**
 * Fetches user's Google Photos albums using the Google Photos Library API.
 */
export async function fetchGooglePhotosAlbums(accessToken: string): Promise<Album[]> {
  const url = 'https://photoslibrary.googleapis.com/v1/albums';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Google Photos Albums fetch failed:', response.status, errorBody);
    throw new Error(`Failed to load Google Photos albums. Status code: ${response.status}`);
  }

  const data = await response.json();
  const rawAlbums = data.albums || [];

  const parsedAlbums: Album[] = await Promise.all(
    rawAlbums.map(async (raw: any) => {
      let coverUrl = raw.coverPhotoBaseUrl || '';
      if (coverUrl) {
        // Appending parameters to get a correct display thumbnail size
        coverUrl = `${coverUrl}=w600-h400-c`;
      } else {
        coverUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=650&q=85';
      }

      // We'll lazy-load photos for each album. For now, initialize empty and fetch on demand,
      // or retrieve a preview block
      return {
        id: raw.id,
        name: raw.title || 'Untitled Google Photos Album',
        year: new Date().getFullYear(), // Google Photos API doesn't specify year directly, default current or infer
        coverUrl: coverUrl,
        photosCount: parseInt(raw.mediaItemsCount || '0', 10),
        description: 'Google Photos sync album. Experience your favorite captured moments dynamically loaded from your personal Google Photos cloud library.',
        photos: [] // lazy loaded
      };
    })
  );

  return parsedAlbums;
}

/**
 * Fetches media items (photos) inside a Google Photos album.
 */
export async function fetchAlbumPhotos(accessToken: string, albumId: string): Promise<Photo[]> {
  const url = 'https://photoslibrary.googleapis.com/v1/mediaItems:search';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      albumId: albumId,
      pageSize: 50, // Grab up to 50 photos
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Google Photos Album media items fetch failed for album ${albumId}:`, response.status, errorBody);
    throw new Error(`Failed to retrieve photos for album ${albumId}.`);
  }

  const data = await response.json();
  const rawItems = data.mediaItems || [];

  return rawItems
    .filter((item: any) => item.mimeType?.startsWith('image/') || item.mimeType?.startsWith('video/'))
    .map((item: any) => {
      const isVideo = item.mimeType?.startsWith('video/');
      // For videos, use =dv for direct mp4 video stream; use =w1200-h800 as cover/thumbnail Url.
      const displayUrl = isVideo ? `${item.baseUrl}=dv` : `${item.baseUrl}=w1200-h800`;
      const thumbnailUrl = isVideo ? `${item.baseUrl}=w1200-h800` : undefined;

      return {
        id: item.id,
        url: displayUrl,
        thumbnailUrl: thumbnailUrl,
        type: isVideo ? 'video' : 'image',
        title: item.filename || (isVideo ? 'Google Video' : 'Google Photo'),
        location: 'Google Photos Sync',
        year: item.mediaMetadata?.creationTime 
          ? new Date(item.mediaMetadata.creationTime).getFullYear() 
          : new Date().getFullYear(),
        description: isVideo 
          ? `Video • Ghi hình lúc ${
              item.mediaMetadata?.creationTime 
                ? new Date(item.mediaMetadata.creationTime).toLocaleDateString()
                : 'Không rõ ngày'
            }`
          : `Ghi lại lúc ${
              item.mediaMetadata?.creationTime 
                ? new Date(item.mediaMetadata.creationTime).toLocaleDateString()
                : 'Không rõ ngày'
            }`
      };
    });
}
