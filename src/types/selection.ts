export type SelectedObjectType = 'monitor' | 'printer' | 'staircase' | null

export interface SpacecraftParams {
  fuselageLength: number
  fuselageRadius: number
  wingSpan: number
  wingThickness: number
  wingsPosition: number
  tailSize: number
  noseConeLength: number
  noseConeRadius: number
  engineCount: number
  engineSize: number
  windowCount: number
  windowSize: number
  hullMetalness: number
  hullRoughness: number
}

export interface StaircaseParams {
  steps: number
  rise: number
  twist: number
  width: number
  depth: number
  thickness: number
  columnRadius: number
  railHeight: number
}

export const DEFAULT_SPACECRAFT_PARAMS: SpacecraftParams = {
  fuselageLength: 8,
  fuselageRadius: 1.2,
  wingSpan: 6,
  wingThickness: 0.4,
  wingsPosition: 2,
  tailSize: 1.5,
  noseConeLength: 2,
  noseConeRadius: 1,
  engineCount: 2,
  engineSize: 0.6,
  windowCount: 4,
  windowSize: 0.3,
  hullMetalness: 0.85,
  hullRoughness: 0.2
}

export const DEFAULT_STAIRCASE_PARAMS: StaircaseParams = {
  steps: 25,
  rise: 0.60,
  twist: 360,
  width: 1.50,
  depth: 0.80,
  thickness: 0.20,
  columnRadius: 0.30,
  railHeight: 2.00
}
