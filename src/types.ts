/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Photo {
  id: string;
  url: string;
  title: string;
  location: string;
  year: number;
  description?: string;
}

export interface Album {
  id: string;
  name: string;
  year: number;
  coverUrl: string;
  photosCount: number;
  description: string;
  photos: Photo[];
}
