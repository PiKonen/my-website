// This project has no backend of any kind, so there is nothing behind the login
// page to send a code or check one. These two functions are the seam where a
// real auth service goes: swap the bodies for fetch() calls and the page above
// them does not change, because it only ever awaits these two promises.
//
// Until then they are a demo. What that means, explicitly:
//
//   - No code is sent anywhere. requestCode logs the code to the console so the
//     flow can be walked through end to end.
//   - verifyCode accepts one hardcoded code and rejects everything else, so the
//     wrong-code error state is reachable without a server.
//   - There is no session, no token and no cookie. Verifying successfully shows
//     a confirmation and nothing else — the user is not actually logged in.
//
// None of this is safe to ship. A real implementation also has to rate-limit
// requests, expire codes server-side, and never tell the client whether the
// address or number is one it knows about.

export type Channel = "email" | "sms";

const DEMO_CODE = "123456";

// Enough delay that the pending state is visible rather than a flicker.
const FAKE_LATENCY_MS = 600;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Sends a one-time code to `destination` over `channel`. Rejects if it can't. */
export async function requestCode(
  channel: Channel,
  destination: string,
): Promise<void> {
  await wait(FAKE_LATENCY_MS);
  console.info(
    `[otp] demo only — no ${channel} was sent. Code for ${destination} is ${DEMO_CODE}`,
  );
}

/** Resolves true if `code` is the one that was sent, false if it is not. */
export async function verifyCode(code: string): Promise<boolean> {
  await wait(FAKE_LATENCY_MS);
  return code === DEMO_CODE;
}
