declare module "cors" {
  const cors: any;
  export default cors;
}

declare module "openid-client" {
  export const discovery: any;
  export const buildEndSessionUrl: any;
  export const refreshTokenGrant: any;

  export type TokenEndpointResponse = any;
  export type TokenEndpointResponseHelpers = any;
}

declare module "openid-client/passport" {
  export const Strategy: any;
  export type VerifyFunction = any;
}

