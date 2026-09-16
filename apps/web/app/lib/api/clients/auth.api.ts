import { createApiClient, AxiosApiClient } from "../../axios";
import type { ApiResource } from "../api.types";
import type { components } from "../generated/api.types";
import { BaseApiClient } from "../index";

export type LoginRequest = components["schemas"]["LoginRequest"];
export type RegisterRequest = components["schemas"]["RegisterRequest"];
export type User = components["schemas"]["User"];
export type UserSingleResponse = components["schemas"]["UserSingleResponse"];
export type UserMetadata =
  components["schemas"]["UserSingleResponse"]["metadata"];
export type UserResult = ApiResource<User, UserMetadata>;

export class AuthApiClient extends BaseApiClient {
  protected readonly path = "/api/v1/auth";

  constructor(api: AxiosApiClient = createApiClient()) {
    super(api);
  }

  public async login(credentials: LoginRequest): Promise<UserResult> {
    const response = await this.api.request<UserSingleResponse>(
      `${this.path}/login`,
      {
        method: "POST",
        headers: this.defaultHeaders,
        data: credentials,
      },
    );
    return this.unpackSingle(response, {
      errMsg: "Invalid user data received from server",
    });
  }

  public async signup(userAttrs: RegisterRequest): Promise<UserResult> {
    const response = await this.api.request<UserSingleResponse>(
      `${this.path}/signup`,
      {
        method: "POST",
        headers: this.defaultHeaders,
        data: userAttrs,
      },
    );
    return this.unpackSingle(response, {
      errMsg: "Invalid user data received from server",
    });
  }

  public async logout(): Promise<void> {
    return this.api.request<void>(`${this.path}/logout`, {
      method: "POST",
      headers: this.defaultHeaders,
    });
  }

  public async refresh(): Promise<void> {
    return this.api.request<void>(`${this.path}/refresh`, {
      method: "POST",
      headers: this.defaultHeaders,
    });
  }

  public async getMe(): Promise<UserResult> {
    const response = await this.api.request<UserSingleResponse>(
      `${this.path}/me`,
    );
    return this.unpackSingle(response, {
      errMsg: "Invalid user data received from server",
    });
  }
}

let _authApi: AuthApiClient | null = null;
export const authApi = new Proxy({} as AuthApiClient, {
  get(_, prop) {
    if (!_authApi) _authApi = new AuthApiClient();
    return _authApi[prop as keyof AuthApiClient];
  },
});
