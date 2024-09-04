export function postGithubSSHKey(
  githubToken: string,
  title: string,
  key: string
) {
  return fetchGithub("/repos/addreas/flakefiles/keys", {
    githubToken,
    method: "POST",
    body: JSON.stringify({ key: key.trim(), title, read_only: false }),
  });
}

type DeviceCodeInfo = {
  user_code: string;
  verification_uri: string;
};
export async function githubDeviceFlow(
  client_id: string,
  getPersistentToken: () => Promise<string | null>,
  setPersistentToken: (token: string) => Promise<void>
): Promise<[DeviceCodeInfo | null, Promise<string>]> {
  const githubToken = await getPersistentToken();
  if (githubToken != null && (await fetchGithub("/user", { githubToken })).ok) {
    return [null, Promise.resolve(githubToken)];
  }

  const deviceCodeRes = await fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: [
      ["Accept", "application/json"],
      ["Content-Type", "application/json"],
    ],
    body: JSON.stringify({
      client_id,
      scope: "repo",
    }),
  }).then((r) => r.json());

  const { user_code, device_code, verification_uri, interval } = deviceCodeRes;
  if (!user_code) {
    throw new Error(`Missing user_code in ${JSON.stringify(deviceCodeRes)}`);
  }

  const refresher = async () => {
    const expiry = Date.now() + 15 * 60 * 1000;
    while (Date.now() < expiry) {
      const { access_token } = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: [
            ["Accept", "application/json"],
            ["Content-Type", "application/json"],
          ],
          body: JSON.stringify({
            client_id,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
            device_code,
          }),
        }
      ).then((r) => r.json());

      if (access_token) {
        await setPersistentToken(access_token);
        return access_token as string;
      }

      await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    }

    throw new Error("device login attempt expired");
  };

  return [{ user_code, verification_uri }, refresher()];
}

function fetchGithub(
  path: string,
  init: RequestInit & { githubToken: string; headers?: [string, string][] }
) {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: [
      ["Accept", "application/vnd.github+json"],
      ["Authorization", `Bearer ${init.githubToken}`],
      ["X-GitHub-Api-Version", "2022-11-28"],
      ...(init.headers ?? []),
    ],
  });
}
