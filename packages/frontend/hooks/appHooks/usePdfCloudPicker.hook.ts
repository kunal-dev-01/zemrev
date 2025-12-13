/* ============================================================================
 * TYPE DEFINITIONS
 * ========================================================================== */
interface GooglePickerView {
  setMimeTypes(mimeTypes: string): GooglePickerView;
}

interface GooglePickerBuilder {
  addView(view: GooglePickerView): GooglePickerBuilder;
  setOAuthToken(token: string): GooglePickerBuilder;
  setCallback(callback: (data: GooglePickerData) => void): GooglePickerBuilder;
  build(): GooglePicker;
}

interface GooglePicker {
  setVisible(visible: boolean): void;
}

interface GooglePickerData {
  action: string;
  docs: Array<{
    id: string;
    name: string;
  }>;
}

interface GooglePickerNamespace {
  PickerBuilder: new () => GooglePickerBuilder;
  View: new (viewId: string) => GooglePickerView;
  ViewId: {
    DOCS: string;
  };
  Action: {
    PICKED: string;
  };
}

interface GoogleOAuthTokenResponse {
  access_token?: string;
}

interface GoogleOAuthClient {
  requestAccessToken(): void;
}

interface GoogleOAuthNamespace {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (response: GoogleOAuthTokenResponse) => void;
  }): GoogleOAuthClient;
}

interface DropboxFile {
  link: string;
  name: string;
}

interface DropboxOptions {
  success: (files: DropboxFile[]) => void;
  cancel: () => void;
  linkType: "direct";
  multiselect: boolean;
  extensions: string[];
}

interface DropboxNamespace {
  choose(options: DropboxOptions): void;
}

interface GapiLoadConfig {
  callback: () => void;
  onerror: () => void;
}

interface GapiNamespace {
  load(api: string, config: GapiLoadConfig): void;
}

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: GoogleOAuthNamespace;
      };
      picker: GooglePickerNamespace;
    };
    gapi: GapiNamespace;
    Dropbox: DropboxNamespace;
  }
}

let googleAccessToken: string | null = null;
let pickerLoaded = false;

/* ============================================================================
 * LOAD GOOGLE PICKER
 * ========================================================================== */
const loadGooglePicker = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (pickerLoaded) {
      resolve();
      return;
    }

    if (!window.gapi) {
      reject("gapi not loaded");
      return;
    }

    window.gapi.load("picker", {
      callback: () => {
        pickerLoaded = true;
        resolve();
      },
      onerror: () => reject("Failed to load Google Picker"),
    });
  });
};

/* ============================================================================
 * WAIT FOR DROPBOX SDK
 * ========================================================================== */
const waitForDropbox = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Dropbox) {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 100;

    const checkDropbox = setInterval(() => {
      attempts++;

      if (window.Dropbox) {
        clearInterval(checkDropbox);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkDropbox);
        reject("Dropbox SDK failed to load after 10 seconds");
      }
    }, 100);
  });
};

export const useCloudPicker = () => {
  /* ============================================================================
   * GOOGLE OAUTH (MODERN)
   * ========================================================================== */
  const getGoogleAccessToken = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (googleAccessToken) {
        resolve(googleAccessToken);
        return;
      }

      if (!window.google?.accounts?.oauth2) {
        reject("Google OAuth SDK not loaded");
        return;
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        callback: (tokenResponse: GoogleOAuthTokenResponse) => {
          if (!tokenResponse.access_token) {
            reject("Google auth failed");
            return;
          }

          googleAccessToken = tokenResponse.access_token;
          resolve(googleAccessToken);
        },
      });

      client.requestAccessToken();
    });
  };

  /* ============================================================================
   * GOOGLE DRIVE PICKER
   * ========================================================================== */
  const pickFromGoogleDrive = async (): Promise<File> => {
    if (!window.gapi || !window.google) {
      throw new Error("Google SDK not loaded");
    }

    await loadGooglePicker();

    const token = await getGoogleAccessToken();

    return new Promise((resolve, reject) => {
      const picker = new window.google.picker.PickerBuilder()
        .addView(
          new window.google.picker.View(
            window.google.picker.ViewId.DOCS
          ).setMimeTypes(
            "application/pdf,image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
          )
        )
        .setOAuthToken(token)
        .setCallback(async (data: GooglePickerData) => {
          if (data.action !== window.google.picker.Action.PICKED) return;

          try {
            const doc = data.docs[0];

            const res = await fetch(
              `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const blob = await res.blob();
            const contentType =
              res.headers.get("Content-Type") ||
              "application/octet-stream";

            resolve(
              new File([blob], doc.name, {
                type: contentType,
              })
            );
          } catch (err) {
            reject(err);
          }
        })
        .build();

      picker.setVisible(true);
    });
  };

  /* ============================================================================
   * DROPBOX PICKER
   * ========================================================================== */
  const pickFromDropbox = async (): Promise<File> => {
    try {
      await waitForDropbox();

      if (!window.Dropbox) {
        throw new Error("Dropbox SDK is still undefined after waiting");
      }

      return new Promise((resolve, reject) => {
        const options: DropboxOptions = {
          success: async (files: DropboxFile[]) => {
            try {
              const file = files[0];
              const res = await fetch(file.link);
              const blob = await res.blob();
              const contentType =
                res.headers.get("Content-Type") ||
                "application/octet-stream";

              resolve(
                new File([blob], file.name, {
                  type: contentType,
                })
              );
            } catch (err) {
              reject(err);
            }
          },
          cancel: () => {},
          linkType: "direct",
          multiselect: false,
          extensions: [
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".avif",
            ".heic",
            ".heif",
          ],
        };

        window.Dropbox.choose(options);
      });
    } catch (err) {
      throw err;
    }
  };

  return {
    pickFromGoogleDrive,
    pickFromDropbox,
  };
};
