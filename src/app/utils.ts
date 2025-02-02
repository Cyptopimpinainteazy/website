import * as adex from "alphadex-sdk-js";
import { TokenInfo } from "./state/pairSelectorSlice";
import type { OrderReceipt } from "alphadex-sdk-js";

export const DEXTER_LOGO_URL =
  "https://assets.coingecko.com/coins/images/34946/standard/DEXTRLogo.jpg";

export function displayPositiveNumber(
  x: number,
  noDigits: number = 6,
  fixedDecimals: number = -1
): string {
  // the same as with displayNumber, but if the number is negative, it will return empty string
  if (x < 0) {
    return "";
  } else {
    return displayNumber(x, noDigits, fixedDecimals);
  }
}

export function getLocaleSeparators(): {
  decimalSeparator: string;
  thousandsSeparator: string;
} {
  return {
    decimalSeparator: ".",
    thousandsSeparator: " ",
  };
}

export function displayNumber(
  x: number,
  nbrOfDigits: number = 6,
  fixedDecimals: number = -1
): string {
  if (nbrOfDigits < 4) {
    return "ERROR: displayAmount cannot work with nbrOfDigits less than 4";
  }

  const { decimalSeparator, thousandsSeparator } = getLocaleSeparators();

  if (x < 1) {
    let roundedNumber = roundTo(x, nbrOfDigits - 2, RoundType.DOWN);
    if (fixedDecimals >= 0 && fixedDecimals <= nbrOfDigits - 2) {
      return roundedNumber.toFixed(fixedDecimals);
    } else {
      return roundedNumber.toString();
    }
  }
  let numberStr = x.toString();
  let wholeNumber = Math.trunc(x);
  let wholeNumberStr = wholeNumber.toString();
  let numberOfSeparators = Math.trunc((wholeNumberStr.length - 1) / 3);
  if (thousandsSeparator != "" && numberOfSeparators > 0) {
    let firstSeparator = wholeNumberStr.length % 3;
    if (firstSeparator == 0) {
      firstSeparator = 3;
    }
    let lastSeparator = firstSeparator + 3 * (numberOfSeparators - 1);
    for (let i = lastSeparator; i > 0; i = i - 3) {
      wholeNumberStr =
        wholeNumberStr.slice(0, i) +
        thousandsSeparator +
        wholeNumberStr.slice(i);
    }
    // console.log("WholeNumberStr: " + wholeNumberStr);
  }
  if (
    wholeNumberStr.length === nbrOfDigits ||
    wholeNumberStr.length === nbrOfDigits - 1
  ) {
    return wholeNumberStr;
  } else {
    if (wholeNumberStr.length < nbrOfDigits) {
      const noDecimals = nbrOfDigits - wholeNumberStr.length;

      let decimalsStr = numberStr.split(decimalSeparator)[1];
      decimalsStr = decimalsStr
        ? decimalsStr.substring(0, noDecimals - 1).replace(/0+$/, "")
        : "";
      if (fixedDecimals >= 0) {
        if (decimalsStr.length > fixedDecimals) {
          decimalsStr = decimalsStr.substring(0, fixedDecimals);
        } else {
          decimalsStr =
            decimalsStr +
            "0".repeat(
              Math.min(fixedDecimals, noDecimals - 1) - decimalsStr.length
            );
        }
      }
      if (decimalsStr) {
        decimalsStr = decimalSeparator + decimalsStr;
      }
      return wholeNumberStr + decimalsStr;
    } else {
      let excessLength = wholeNumberStr.length - nbrOfDigits + 1;
      let excessRemainder = excessLength % 4;
      let excessMultiple = Math.trunc(excessLength / 4);
      let displayStr = wholeNumberStr.slice(0, nbrOfDigits - 1);
      switch (excessRemainder) {
        case 0:
          if (excessMultiple > 0) {
            excessMultiple = excessMultiple - 1;
          }
          break;
        case 1:
          displayStr =
            displayStr.slice(0, -3) + decimalSeparator + displayStr.slice(-2);
          break;
        case 2:
          displayStr =
            displayStr.slice(0, -2) + decimalSeparator + displayStr.slice(-1);
          break;
        case 3:
          displayStr = displayStr.slice(0, -1);
          break;
      }
      switch (excessMultiple) {
        case 0:
          displayStr = displayStr + "K";
          break;
        case 1:
          displayStr = displayStr + "M";
          break;
        case 2:
          displayStr = displayStr + "B";
          break;
        case 3:
          displayStr = displayStr + "T";
          break;
        default:
          displayStr = displayStr + "G";
          break;
      }
      return displayStr;
    }
  }
}

export enum RoundType {
  UP = "UP", // rounds away from zero
  DOWN = "DOWN", // rounds towards zero
  NEAREST = "NEAREST", // rounds to the nearest
}

// utility function to round a number to a specified number of decimals
export function roundTo(
  x: number, // the number to be rounded
  decimals: number, // the number of decimals to be rounded to
  roundType: RoundType = RoundType.NEAREST // the method of rounding
): number {
  let result = x;
  if (decimals > 10) {
    decimals = 10;
  }
  switch (roundType) {
    case RoundType.NEAREST: {
      result = Math.round(x * 10 ** decimals) / 10 ** decimals;
      break;
    }
    case RoundType.UP: {
      if (x > 0) {
        result = Math.ceil(x * 10 ** decimals) / 10 ** decimals;
      } else {
        result = Math.floor(x * 10 ** decimals) / 10 ** decimals;
      }
      break;
    }
    case RoundType.DOWN: {
      if (x > 0) {
        result = Math.floor(x * 10 ** decimals) / 10 ** decimals;
      } else {
        result = Math.ceil(x * 10 ** decimals) / 10 ** decimals;
      }
      break;
    }
  }
  return result;
}

// utility function to shorten any string to an abbreviated version
// useful for showing long strings like on-ledger addresses and tx hashes
// e.g. default settings will shorten the string "uweriugcwieywegwe864r8dt864g3g487t5rgd34df384t" to "uwer...394t"
export function shortenString(
  fullStr: string, // the string you want to shorten
  showStart: number = 4, // how many chars of the string to show at the start of the abbreviation
  showEnd: number = showStart, // how many chars to show at the end of the abbreviation
  seperator: string = "..." // the chars to show in the middle of the abbreviation
): string {
  if (!fullStr || fullStr.length <= showStart + showEnd + 2) {
    return fullStr;
  } else {
    return (
      fullStr.slice(0, showStart) +
      (showEnd > 0 ? seperator + fullStr.slice(-showEnd) : "")
    );
  }
}

// utility function to display dates and times
// can be adjusted for DeXter
export function displayTime(
  date: Date | string, // date/time to display
  period: string = "" // the period that you want to display date/time for
): string {
  if (typeof date == "string") {
    date = new Date(date);
  }

  if (period === "full") {
    return date
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+)/, "$3-$1-$2 $4");
    // TODO: remove once adex supports higher precision (seconds)
  } else if (period === "full_without_seconds") {
    return date
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        // second: "2-digit", // <- seconds removed
        hour12: false,
      })
      .replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+)/, "$3-$1-$2 $4");
  } else if (!period) {
    return date.toLocaleString([], {
      month: "2-digit",
      day: "2-digit",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (["1D", "1W", "1M"].includes(period)) {
    return date.toLocaleDateString([], {
      month: "2-digit",
      day: "2-digit",
    });
  } else {
    return date.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

// Styling changes for Direction(side) in table
export function displayOrderSide(side: string): {
  text: string;
  className: string;
} {
  if (side === "BUY") {
    return { text: "buy", className: "text-dexter-green" };
  } else if (side === "SELL") {
    return { text: "sell", className: "text-dexter-red" };
  } else {
    return { text: "-", className: "" };
  }
}

//Compute Total fees from OrderReceipts
//This rounds to 4 decimal places if applicable. Otherwise keep original
export function calculateTotalFees(order: any): number {
  const {
    exchange_fee: exchangeFee,
    liquidity_fee: liquidityFee,
    platform_fee: platformFee,
  } = order;
  const totalFees = exchangeFee + liquidityFee + platformFee;
  const decimalPart = (totalFees % 1).toString().split(".")[1];
  return decimalPart && decimalPart.length > 4
    ? roundTo(totalFees, 4, RoundType.NEAREST)
    : totalFees;
}

//Calculate the Avg Filled from recieved token amounts
export function calculateAvgFilled(tokenOne: number, tokenTwo: number): number {
  if (tokenOne == 0 || tokenTwo == 0) return 0;
  const avgFilled = tokenTwo / tokenOne;
  const decimalPart = (avgFilled % 1).toString().split(".")[1];
  return decimalPart && decimalPart.length > 8
    ? roundTo(avgFilled, 8, RoundType.NEAREST)
    : avgFilled;
}

//Chart Helper Functions
export const formatPercentageChange = (percChange: number | null): string => {
  if (percChange !== null) {
    return `(${percChange.toFixed(2)}%)`;
  }
  return "(0.00%)";
};

export function numberOrEmptyInput(event: string) {
  let amount: number | "";

  if (event === "") {
    amount = "";
  } else {
    amount = Number(event);
  }
  return amount;
}

// Replace DEXTR iconUrl with coingecko hosted url.
export function updateIconIfNeeded(token: adex.TokenInfo): TokenInfo {
  const iconUrl =
    token.symbol === "DEXTR"
      ? // use asset from coingecko to prevent ipfs failure
        DEXTER_LOGO_URL
      : token.symbol === "RDK"
      ? // fix wrong icon URL in metadata ofRDK on ledger, see https://t.me/radix_dlt/716425
        "https://radket.shop/img/logo.svg"
      : token.symbol === "EDG"
      ? // use smaller version to save bandwidth
        "coins/EDG-100x100.png"
      : token.symbol === "HNY"
      ? // use smaller version to save bandwidth
        "coins/HNY-100x100.png"
      : token.iconUrl;

  return {
    ...token,
    iconUrl,
  };
}

// Given an order, determine token symbol in which the price is expressed
// Note: Price is always expressed in terms of the second currency in the trading pair.
export function getPriceSymbol(order: OrderReceipt): string {
  if (!order.pairName.includes("/")) {
    return "";
  }
  return order.pairName.split("/")[1];
}

export function capitalizeFirstLetter(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

// Gets amount precision for each token traded on dexteronradix.
// Note: precision for price is different.
export function getPrecision(input: string): number {
  return (
    {
      XRD: 2,
      DEXTR: 2,
      CASSIE: 0,
      CAVIAR: 2,
      DFP2: 2,
      DGC: 0,
      FLOOP: 5,
      HUG: 0,
      MNI: 0,
      OCI: 2,
      PLANET: 0,
      RDK: 0,
      WEFT: 2,
      XRAW: 0,
      XUSDC: 2,
    }[input.toUpperCase()] || 2
  );
}

export function formatNumericString(
  value: string,
  separator: string,
  scale: number
): string {
  const regex = separator === "." ? /[^\d.-]/g : /[^\d,-]/g;
  let formattedValue = value.replace(regex, "");
  // Ensure only the first occurrence of the separator is allowed
  const parts = formattedValue.split(separator);
  if (parts.length > 2) {
    // Rejoin with a single separator, discarding additional separators
    formattedValue = parts[0] + separator + parts.slice(1).join("");
  }
  // Allow a trailing separator for user input
  if (formattedValue.endsWith(separator)) {
    return formattedValue;
  }
  // Split and limit fraction scale as before
  let [whole, fraction] = formattedValue.split(separator);
  if (fraction && fraction.length > scale) {
    fraction = fraction.substring(0, scale);
  }
  return fraction ? `${whole}${separator}${fraction}` : whole;
}

export function truncateWithPrecision(num: number, precision: number): number {
  const split = num.toString().split(".");
  if (split.length !== 2) {
    return num;
  }
  const [part1, part2] = split;
  return Number(`${part1}.${part2.substring(0, precision)}`);
}

// Sets a URL query parameter and updates the browser's history state
// without triggering a reload of the page.
export function setQueryParam(key: string, value: string) {
  if (!window) {
    return;
  }
  const url = new URL(window.location?.href);
  url.searchParams.set(key, value);
  history.pushState({}, "", url);
}

// Mimicks function .toFixed(n) but always rounds down and returns a number (not a string)
export function toFixedRoundDown(number: number, decimals: number): number {
  if (decimals < 0) {
    throw new Error("Precision cannot be negative");
  }
  let numberParts = number.toString().split(".");
  // If there's no decimal part or decimals is zero, just return the integer part
  if (numberParts.length === 1 || decimals === 0) {
    return Number(numberParts[0]);
  }
  let integerPart = numberParts[0];
  let decimalPart = numberParts[1].substring(0, decimals);
  // Ensure the decimal part has enough digits
  if (decimalPart.length < decimals) {
    decimalPart = decimalPart + "0".repeat(decimals - decimalPart.length);
  }
  return Number(integerPart + "." + decimalPart);
}

// SHortens radix wallet address
export function shortenWalletAddress(address: string): string {
  // minimal length is 35 chars
  if (address.length < 35) {
    return address;
  }
  const firstPart = address.slice(0, 8);
  const lastPart = address.slice(-20);
  return `${firstPart}...${lastPart}`;
}

export function setLocalStoragePaginationValue(pageSize: number, id?: string) {
  if (typeof window === "undefined") return undefined;

  window.localStorage.setItem(
    `pagination:${id ?? window?.location.pathname}`,
    String(pageSize)
  );
}

export function getLocalStoragePaginationValue(id?: string) {
  if (typeof window === "undefined") return undefined;

  const existingValue = window.localStorage.getItem(
    `pagination:${id ?? window.location?.pathname}`
  );
  if (existingValue !== null) {
    const pageNumber = Number(existingValue);
    return pageNumber < 1 ? 10 : pageNumber;
  }

  return undefined;
}

// TODO: Update input and return types to `PairInfo[]`. Currently using `any`
// due to unresolved issues. Investigate the cause of the problem.
export function searchPairs(query: string, pairsList: any): any {
  const searchQuery = query.trim().toLowerCase().replace(/\s+/g, " ");

  function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = Array.from({ length: a.length + 1 }, () => []);

    for (let i = 0; i <= a.length; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + 1
          );
        }
      }
    }

    return matrix[a.length][b.length];
  }

  const hasTypoTolerance = (source: string, target: string): boolean => {
    const maxTyposAllowed = Math.floor(source.length / 5);
    const distance = levenshteinDistance(source, target);
    return distance <= maxTyposAllowed;
  };

  const preprocessPairName = (name: string): string =>
    name.toLowerCase().replace(/\//g, " ");

  const preprocessToken = (token: { symbol: string; name: string }) => ({
    symbol: token.symbol.toLowerCase(),
    name: token.name.toLowerCase(),
  });

  const generateCombinations = (items: string[]): string[] => {
    const combinations: string[] = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        combinations.push(`${items[i]} ${items[j]}`);
        combinations.push(`${items[j]} ${items[i]}`);
      }
    }
    return combinations;
  };

  return pairsList.filter((pair: any) => {
    const pairName = preprocessPairName(pair.name);
    const pairNameReversed = pairName.split(" ").reverse().join(" ");
    const token1 = preprocessToken(pair.token1);
    const token2 = preprocessToken(pair.token2);

    const baseMatches = [
      pairName,
      pairNameReversed,
      token1.symbol,
      token2.symbol,
      token1.name,
      token2.name,
    ];

    const dynamicMatches = generateCombinations(baseMatches);

    const nameMatches = [...baseMatches, ...dynamicMatches];

    return nameMatches.some(
      (nameMatch) =>
        nameMatch.includes(searchQuery) ||
        hasTypoTolerance(searchQuery, nameMatch)
    );
  });
}
