import axios from "axios";

export interface ConvertKitConfig {
  apiSecret: string;
  apiUrl?: string;
}

export class ConvertKit {
  private apiSecret: string;
  private apiUrl: string;

  constructor() {
    this.apiSecret = process.env.CONVERTKIT_API_SECRET || "";
    this.apiUrl = "https://api.kit.com/v3";
  }

  /**
   * Removes a subscriber from ConvertKit
   * @param subscriberId The ConvertKit subscriber ID to remove
   * @returns Promise resolving to the API response
   * @throws Error if the API call fails
   */
  async removeSubscriber(email: string) {
    try {
      const url = `${this.apiUrl}/unsubscribe`;
      console.log("ConvertKit URL:", url);
      const headers = {
        "Content-Type": "application/json",
        Accept: "",
        Authorization: `Bearer ${this.apiSecret}`,
      };

      const data = {
        email: email,
        api_secret: this.apiSecret,
      };

      const response = await axios.put(url, data, { headers });

      console.log("ConvertKit response:", response);

      return { success: response.status === 204, message: "Subscriber removed successfully" };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (axios.isAxiosError(error)) {
          console.log("ConvertKit response:", error);
          return { success: false, message: error.message };
        }
      }
    }
  }
}
