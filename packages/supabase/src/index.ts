export {
  createBrowserSupabaseClient,
  createSupabaseClient,
  type SupabaseClient,
  type SupercampusSupabaseClient,
} from './client.js';
export { loadSupabaseEnv, supabaseEnvSchema, type SupabaseEnv } from './env.js';
export { type Database, type Tables, type TablesInsert, type TablesUpdate } from './database.types.js';
export { SupabaseProvider, useSupabase } from './provider.js';
export { createDatabase, type DatabaseClient } from './database.js';
export { createStorage, type StorageClient } from './storage.js';
export { createRealtime, type RealtimeClient } from './realtime.js';
export { isSupabaseError, type SupabaseError } from './helpers.js';
export { createAuthService, type AuthCredentials, type AuthResult, type SupabaseAuthService } from './auth.js';
export { AuthProvider, useAuth, type AuthContextValue } from './authProvider.js';
export { createProfileService, type Profile, type ProfileEducation, type ProfileEducationInput, type ProfileExperience, type ProfileExperienceInput, type ProfileResult, type ProfileService, type ProfileSkill, type ProfileUpdate, type Skill, type UserSettings, type UserSettingsUpdate } from './profile.js';
export { ProfileProvider, useProfile, type ProfileContextValue } from './profileProvider.js';
export { createAuthorizationService, type AuthorizationFeature, type AuthorizationRole, type AuthorizationService, type AuthorizationSnapshot } from './authorization.js';
export { AuthorizationProvider, useAuthorization, useCurrentCampus, useFeatures, useHasFeature, useHasPermission, usePermissions, useRoles, type AuthorizationContextValue } from './authorizationProvider.js';
export { createFeedService, type CreateCommentInput, type CreatePostInput, type FeedAuthor, type FeedComment, type FeedCursor, type FeedMedia, type FeedMediaKind, type FeedPage, type FeedPost, type FeedQuery, type FeedResult, type FeedService, type FeedVisibility, type PostMediaInput, type UpdateCommentInput, type UpdatePostInput } from './feed.js';
export { createMarketplaceService } from './marketplace.js';
export type {
  MarketplaceService,
  MarketplaceProduct,
  MarketplaceCategory,
  MarketplaceSeller,
  ProductMedia,
  MarketplaceQuery,
  MarketplaceCursor,
  MarketplacePage,
  MarketplaceResult,
  MarketplaceStatus,
  CreateProductInput,
  UpdateProductInput,
  ProductMediaInput,
} from './marketplace.js';
export { createFoodService } from './food.js';
export type {
  FoodService,
  FoodVendor,
  FoodMenuCategory,
  FoodMenuItem,
  FoodMenu,
  FoodOrder,
  FoodOrderItem,
  FoodOrderStatus,
  FoodPaymentStatus,
  FoodFulfillmentType,
  FoodOrderLineInput,
  CreateFoodOrderInput,
  FoodResult,
} from './food.js';
export { createRoleRequestService, type RoleRequest, type RoleRequestInput, type RoleRequestResult, type RoleRequestService, type RoleRequestStatus, type RoleRequestWithRole } from './roleRequests.js';
export { RoleRequestsProvider, useRoleRequests, type RoleRequestsContextValue } from './roleRequestsProvider.js';
export { createProjectService } from './projects.js';
export type {
  ProjectService, ProjectResult, ProjectDetail, ProjectMemberProfile, ProjectSkill, ProjectQuery,
  ProjectCursor, ProjectPage, CreateProjectInput, UpdateProjectInput, ProjectResultGeneric,
} from './projects.js';
export { createCampaignService } from './campaigns.js';
export type {
  CampaignService, CampaignResult, CampaignContribution, CampaignUpdate,
  CreateCampaignInput, UpdateCampaignInput, CampaignResultGeneric,
  CampaignBrowseResult, CampaignCursor, CampaignQuery, CampaignPage,
} from './campaigns.js';
export { createDirectoryService, type DirectoryService, type DirectoryProfile, type DirectoryResult, type DirectoryQuery, type DirectoryPage } from './directory.js';
export { createJobService, type JobService, type JobResult, type JobDetail, type JobQuery, type JobPage, type CreateJobInput, type JobResultGeneric } from './jobs.js';
export { createEventService, type EventService, type EventResult, type EventQuery, type EventPage, type CreateEventInput, type EventResultGeneric } from './events.js';
