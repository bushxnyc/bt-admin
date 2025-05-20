import { createHmacSha1 } from "@/lib/SHA1";
import { DOMParser } from "@xmldom/xmldom";

export class Epoch {
  public async cancelEpoch(membershipId: string) {
    const params_array = {
      api_action: "cancel",
      auth_pass: `${process.env.EPOCH_USER_PASS}`,
      auth_user: `${process.env.EPOCH_USER}`,
      cancel_reason: "movn",
      member_id: membershipId,
    };

    const queryParams = this.objectToQueryParams(params_array);
    const epoch_digest = await this.get_digest(params_array);
    const url = "https://epoch.com/services/customer_search?" + queryParams + "&epoch_digest=" + epoch_digest;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Cancellation Call to Epoch Failed");
      }

      const xml = await response.text();
      // console.log(xml);
      const value = await this.returnValue(xml);

      switch (value) {
        case "Success":
          return { success: true, message: "SUCCESS" };
        case "NMYALREADYCANCELLED":
          return { success: true, message: "SUCCESS" };
        default:
          return { success: false, message: "FALED" };
      }
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: error.message };
      }
    }
  }

  private async get_digest(paramsObj: EpochCommandParams | EpochSaleParams) {
    const key = process.env.EPOCH_DIGEST_KEY || "";
    const str = Object.entries(paramsObj)
      .map(([key, value]) => `${key}${value}`)
      .join("");

    const hash = await createHmacSha1(str, key);
    // console.log(hash);
    return hash;
  }

  private async returnValue(xml: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    const errorReponse = xmlDoc.getElementsByTagName("ErrorResponse")[0];
    if (errorReponse) {
      throw new Error(errorReponse.textContent || "");
    }
    const response = xmlDoc.getElementsByTagName("Response")[1].textContent;
    return response;
  }

  private objectToQueryParams(obj: EpochSaleParams | EpochCommandParams) {
    return Object.entries(obj)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");
  }

  public async getEpochLink(btUserId: string, btEmail: string) {
    const sale_params = {
      api: "join",
      email: btEmail,
      no_userpass: "true",
      pi_code: process.env.EPOCH_PI_CODE || "",
      reseller: "a",
      x_btid: btUserId,
    };

    const queryParams = this.objectToQueryParams(sale_params);
    const epoch_digest = await this.get_digest(sale_params);
    const url = process.env.EPOCH_URL + queryParams + "&epoch_digest=" + epoch_digest;
    // console.log(url);
    return url;
  }
}

type EpochSaleParams = {
  api: string;
  no_userpass: string;
  pi_code: string;
  reseller: string;
  x_btid: string;
};

type EpochCommandParams = {
  api_action: string;
  auth_pass: string;
  auth_user: string;
  cancel_reason: string;
  member_id: string;
};

export const epoch = new Epoch();
