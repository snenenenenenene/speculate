import { loadStripe, Stripe } from "@stripe/stripe-js";

export function formatAmountForDisplay(
  amount: number,
  currency: string
): string {
  const numberFormat = new Intl.NumberFormat(["be-NL"], {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
  });
  return numberFormat.format(amount);
}

export async function fetchPostJSON(url: string, data?: object) {
  try {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data || {}), // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
  } catch (err) {
    console.log(err);
  }
}

export const formatter = new Intl.NumberFormat("be-NL", {
  style: "currency",
  currency: "EUR",
});

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export function formatAmountForStripe(
  amount: number,
  currency: string
): number {
  const currencies = {
    USD: 100, // 1 USD = 100 cents
    EUR: 100,
    GBP: 100,
    JPY: 1, // Japanese Yen doesn't use cents
  };

  const multiplier = currencies[currency.toUpperCase() as keyof typeof currencies] || 100;
  return Math.round(amount * multiplier);
}

export function formatAmountFromStripe(
  amount: number,
  currency: string
): number {
  const currencies = {
    USD: 100,
    EUR: 100,
    GBP: 100,
    JPY: 1,
  };

  const divider = currencies[currency.toUpperCase() as keyof typeof currencies] || 100;
  return amount / divider;
}
