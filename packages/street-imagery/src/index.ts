// Config
export {
  createStreetImageryConfig,
  getPanoramaxApiBase,
  getStreetImageryConfig,
  setStreetImageryConfig,
  type Infra3dConfig,
  type Infra3dProject,
  type StreetImageryConfig,
} from './config'

// Providers: model, metadata, adapter registry
export {
  PROVIDER_IDS,
  type Bbox,
  type NormalizedMapFeature,
  type NormalizedPhoto,
  type NormalizedSequence,
  type PhotoDetails,
  type ProviderAdapter,
  type ProviderId,
  type ProviderKind,
  type SequenceTiles,
  type TileCoord,
} from './providers/model'
export { providerById, PROVIDERS, type ProviderMeta } from './providers/meta'
export { getBingMapsKey } from './providers/adapters/streetside'
export { lookAroundDeepLink } from './providers/adapters/lookaround'
export { fetchStreetViewMetadata, getGoogleMapsApiKey } from './providers/adapters/streetview'
export {
  fetchedSequencesMinZoom,
  getProviderAdapter,
  isBrowserAvailableProvider,
  isClickOnlyPhotoProvider,
  providerCoversBbox,
  registerProviderAdapters,
} from './providers/registry'
export { bboxIntersects } from './providers/tileMath'

// MapLibre source and layer ids, shared by the React layers and hosts that query them
export {
  featureLayerId,
  featureSourceId,
  photoLayerId,
  photoSourceId,
  photoTargetLayerId,
  sequenceLayerId,
  sequenceSourceId,
  sequenceTilesLayerId,
  sequenceTilesSourceId,
  viewfieldLayerId,
  viewfieldLineLayerId,
  viewfieldSourceId,
} from './providers/registry'

// GeoJSON and map styling
export {
  emptyLineCollection,
  emptyPointCollection,
  mapFeaturesToFeatureCollection,
  photosToFeatureCollection,
  sequencesToFeatureCollection,
} from './data/geojson'
export {
  emptyPolygonCollection,
  photosToViewfieldsFeatureCollection,
  VIEWFIELD_MIN_ZOOM,
  viewfieldZoomStep,
  type ViewfieldOptions,
  type ViewfieldPhotoProps,
} from './map/viewfields'
export { coneRadiusMeters, viewConeGeoJson, viewShapeRadiusMeters } from './map/viewCone'
export { alignLineToPoints } from './map/alignLine'
export { renameExpressionProperties } from './map/renameExpressionProperties'
export { MAP_FEATURE_COLOR, PHOTO_TYPE_COLORS, photoTypeColorExpression } from './map/styleColors'
export {
  ageStepColorExpression,
  ageStepMatchExpression,
  countByAgeStep,
  createAgeSteps,
  MAX_USEFUL_AGE_YEARS,
  yearsAgoMs,
  type AgeStep,
  type AgeStepsOptions,
} from './map/ageSteps'

// Filters
export {
  assertIsoDate,
  buildMapFeatureLayerFilter,
  buildPhotoLayerFilter,
  type DateRange,
  isIsoDate,
  mapFeatureMatchesDateRange,
  parseIsoDateEndMs,
  parseIsoDateStartMs,
  photoFilter,
  photoMatchesDateRange,
  photoMatchesFilters,
  type PhotoTypeFilter,
} from './filters/searchFilters'
export {
  dateRangeToSliderPositions,
  dateSliderBins,
  dateSliderPosition,
  dateSliderTime,
  sliderPositionsToDateRange,
  type DateSliderPositions,
  type DateSliderScale,
} from './filters/dateSlider'

// Viewer: links and photo URLs
export { providerExternalLink, type PhotoView } from './viewer/externalLinks'
export {
  photoFullUrlQueryKey,
  photoThumbnailQueryKey,
  resolvePhotoPanoramaUrl,
  resolvePhotoThumbnailUrl,
} from './viewer/photoThumbnails'

// Clicked photos: group nearby photos and pick one
export { clickRadiusMeters, haversineDistanceMeters } from './viewer/clickRadius'
export {
  distanceToPhoto,
  findGroupBySelection,
  findNearestPhoto,
  groupClickedPhotos,
  photoGroupSequenceId,
  type PhotoSequenceGroup,
} from './viewer/groupClickedPhotos'

// Viewpoints
export {
  angleDiffDeg,
  bearingDeg,
  destinationPoint,
  distanceMeters,
  lineLengthMeters,
  type LngLat,
  pointAlongLine,
  snapToLine,
} from './viewpoints/geometry'
export {
  viewpointFromPoint,
  viewpointsFromLine,
  viewpointsIntoNode,
  type ViewDirection,
  type ViewDirectionKind,
  type Viewpoint,
  type ViewpointRole,
  type ViewpointsFromLineOptions,
} from './viewpoints/viewpoints'
export {
  buildViewSuggestions,
  type PhotoCandidate,
  type PhotoLookingAt,
  rankPhotosForDirection,
  rankPhotosLookingAt,
  type RankPhotosLookingAtOptions,
  type RankPhotosOptions,
  type ViewSuggestion,
  yearsToMs,
} from './viewpoints/rankPhotos'
export {
  mapillaryPhotoSource,
  streetViewPhotoSource,
  type ViewpointPhotoSource,
} from './viewpoints/photoSources'

// Mapillary: images, map features, detections
export {
  AGE_BAND_COLORS,
  ageBand,
  type AgeBand,
  ageBandColorExpression,
} from './mapillary/ageBands'
export { fetchImageDetections, type MapillaryDetection } from './mapillary/detections'
export {
  countByGroup,
  JUNCTION_DETECTION_GROUPS,
  JUNCTION_FEATURE_GROUPS,
  matchesAnyGroup,
  OTHER_SIGNS_GROUP_ID,
  SIGN_GROUP_IDS,
  SIGN_GROUPS,
  signGroupFilter,
  type MapFeatureGroup,
  type SignGroupId,
} from './mapillary/featureGroups'
export { createMapillaryHighlightResolver, type HighlightSubject } from './mapillary/highlight'
export { mapillaryIconUrl } from './mapillary/icons'
export { fetchMapillaryImages, type MapillaryImageDetails } from './mapillary/imageInfo'
export {
  bboxAround,
  fetchMapFeatureImages,
  fetchMapillaryMapFeaturesInBbox,
  type MapFeatureImages,
  type MapillaryMapFeature,
} from './mapillary/mapFeatures'
export {
  mapillaryImagesOfTags,
  type MapillaryTagImage,
  type MapillaryTagKey,
  type OsmTags,
} from './mapillary/osmTagKeys'
export {
  bestTargetImage,
  cameraPitch,
  panoX,
  PLACE_TARGET,
  SIGN_TARGET,
  targetImagesByDay,
  targetImageToPhoto,
  viewFromFlatCamera,
  viewFromLocation,
  viewFromOutline,
  type FlatCamera,
  type TargetImage,
  type TargetImageDay,
  type TargetShape,
  type ViewTarget,
} from './mapillary/targetView'

// Open a place in another service
export { buildInfra3dUrl, type Infra3dPointTo, type Infra3dUrlOptions } from './openers/infra3d'
export {
  findLocationOpener,
  getLocationOpeners,
  getLocationOpenersAt,
  LOCATION_OPENERS,
  type LocationOpener,
  type LocationOpenerId,
  openExternalUrl,
  openLocationInNewTab,
  type OpenTarget,
} from './openers/locationOpeners'

// Dates and texts
export {
  DEFAULT_STREET_IMAGERY_LOCALE,
  formatDate,
  formatDateTooltip,
  formatLocalDateTime,
  formatMonth,
  formatRelativeDate,
  mapillaryValueName,
  STREET_IMAGERY_LOCALES,
  type StreetImageryLocale,
} from './i18n'
