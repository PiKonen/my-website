import { useEffect, useState, type FormEvent } from "react";
import { Button, Input, Label, Nav, Radio } from "pinx-ui";
import { MENU, useContent } from "./content";
import { requestCode, verifyCode, type Channel } from "./otp";

// Passwordless login. Two steps, one page: pick how the one-time code should
// arrive (email or SMS) and give the address it should go to, then type the code
// back in. A third step confirms.
//
// There is no Figma frame for this page — it is built from the design system's
// own components and tokens rather than from a design, so the layout is plain:
// one narrow column, everything stacked. It uses the same Nav as the landing
// page so it reads as the same site. Spacing, type and colour are all pinx-ui
// 0.5.0 tokens (spacing 2xs 8 · xs 12 · s 16 · m 24 · l 32 · xl 48).
//
// Three things the design system does not cover, worked around rather than
// invented over — see the notes at each site: Input has no `type`, Button has no
// `type`, and there is no fieldset/legend component for a radio group.

// Deliberately loose. The only thing a client can usefully check is that the
// value has the shape of an address at all; whether it exists, and whether it
// is the user's, is the server's business and the code's.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?\d{7,15}$/;
const CODE_PATTERN = /^\d{6}$/;

// Phone numbers get written with spaces, dashes and brackets in them, and all
// three are noise. Strip before testing, and send the stripped form.
function normalisePhone(value: string): string {
  return value.replace(/[\s()-]/g, "");
}

// Seconds before "send a new code" is offered again. A cooldown is the client's
// half of not letting someone spam a stranger's inbox; the server has to hold
// the other half, since nothing here stops a scripted caller.
const RESEND_COOLDOWN_S = 30;

type Step = "request" | "verify" | "done";

export function LoginPage() {
  const content = useContent();

  const [step, setStep] = useState<Step>("request");
  const [channel, setChannel] = useState<Channel>("email");

  // Kept apart rather than as one `destination`, so switching channel back and
  // forth does not throw away what was already typed into the other field.
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  // Where the code actually went, captured at send time. Reading `email`/`phone`
  // in step 2 would let the confirmation line drift if the field were edited.
  const [sentTo, setSentTo] = useState("");

  const [destinationError, setDestinationError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // One timeout per remaining second: the effect re-runs on each decrement and
  // stops itself at zero. Cheap, and it cancels cleanly on unmount.
  useEffect(() => {
    if (cooldown === 0) return;
    const timer = window.setTimeout(() => {
      setCooldown((remaining) => remaining - 1);
    }, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [cooldown]);

  if (!content) return null;

  const isEmail = channel === "email";
  const destination = isEmail ? email : normalisePhone(phone);

  function validateDestination(): string | null {
    if (isEmail) {
      return EMAIL_PATTERN.test(email) ? null : content!["error.Login_Email"];
    }
    return PHONE_PATTERN.test(normalisePhone(phone))
      ? null
      : content!["error.Login_Phone"];
  }

  async function send() {
    const problem = validateDestination();
    setDestinationError(problem);
    if (problem) return;

    setPending(true);
    try {
      await requestCode(channel, destination);
      setSentTo(destination);
      setCode("");
      setCodeError(null);
      setCooldown(RESEND_COOLDOWN_S);
      setStep("verify");
    } catch (error: unknown) {
      console.error("Could not request a one-time code", error);
      setDestinationError(content!["error.Login_SendFailed"]);
    } finally {
      setPending(false);
    }
  }

  async function resend() {
    setPending(true);
    try {
      await requestCode(channel, sentTo);
      setCode("");
      setCodeError(null);
      setCooldown(RESEND_COOLDOWN_S);
    } catch (error: unknown) {
      console.error("Could not request a one-time code", error);
      setCodeError(content!["error.Login_SendFailed"]);
    } finally {
      setPending(false);
    }
  }

  async function verify() {
    if (!CODE_PATTERN.test(code)) {
      setCodeError(content!["error.Login_Code"]);
      return;
    }

    setPending(true);
    try {
      const ok = await verifyCode(code);
      if (ok) {
        setStep("done");
      } else {
        setCodeError(content!["error.Login_CodeWrong"]);
      }
    } catch (error: unknown) {
      console.error("Could not verify the one-time code", error);
      setCodeError(content!["error.Login_SendFailed"]);
    } finally {
      setPending(false);
    }
  }

  function restart() {
    setStep("request");
    setCode("");
    setCodeError(null);
    setDestinationError(null);
    setCooldown(0);
  }

  // Button renders a <button> with no type attribute, so inside a form every
  // one of them is a submit button. That is what makes Enter-in-a-field work:
  // the browser clicks the default submit button, its onClick runs the step, and
  // the submit event that follows is stopped here. onSubmit must therefore do
  // nothing but preventDefault — putting the step handler here as well would
  // run it twice.
  function swallowSubmit(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <div className="min-h-screen bg-white font-body text-body">
      <Nav
        siteName={content["label.SiteName"]}
        links={MENU.map((item) => ({ label: content[item.key], href: item.href }))}
      />

      <main className="mx-auto flex w-full max-w-sm flex-col gap-l px-s py-xl md:px-0">
        <header className="flex flex-col gap-2xs">
          <h1 className="font-display text-display-md text-body">
            {step === "done"
              ? content["label.Login_DoneTitle"]
              : content["label.Login_Title"]}
          </h1>
          <p className="text-body-md text-body-disabled">
            {step === "done"
              ? content["label.Login_DoneBody"]
              : content["label.Login_Intro"]}
          </p>
        </header>

        {step === "request" && (
          <form className="flex flex-col gap-m" onSubmit={swallowSubmit}>
            {/* The design system has no grouped-control component, so the
                grouping is native: a fieldset for the group and a legend for its
                name, which is what makes a screen reader announce "How should we
                send your code?" before each option. Label supplies the type
                styling inside the legend rather than the legend being styled by
                hand. Radio itself carries its own <label>, so each option needs
                no wrapper. */}
            <fieldset className="flex flex-col gap-xs">
              <legend className="mb-xs">
                <Label label={content["label.Login_ChannelLegend"]} />
              </legend>
              <Radio
                name="otp-channel"
                value="email"
                checked={isEmail}
                onChange={() => {
                  setChannel("email");
                  setDestinationError(null);
                }}
                label={content["label.Login_ChannelEmail"]}
                disabled={pending}
              />
              <Radio
                name="otp-channel"
                value="sms"
                checked={!isEmail}
                onChange={() => {
                  setChannel("sms");
                  setDestinationError(null);
                }}
                label={content["label.Login_ChannelSms"]}
                disabled={pending}
              />
            </fieldset>

            {/* One field, re-labelled by channel, rather than two that swap —
                the value behind it swaps, but the control does not, so focus and
                the field's position on the page stay put.

                Input has no `type` prop, so this is a text input whichever
                channel is chosen: no email or tel keyboard on mobile, and no
                browser autofill for either. Both are design-system gaps rather
                than something to route around locally — Input would need `type`
                (and, for the code field, `inputMode` and `autoComplete`) for
                this page to do better. Worth raising against the contract.

                Input's own <label> is a bare <label> with no htmlFor, so it is
                not programmatically tied to its input either. Same story: a fix
                belongs in the component. */}
            <Input
              label={
                isEmail
                  ? content["label.Login_EmailLabel"]
                  : content["label.Login_PhoneLabel"]
              }
              value={isEmail ? email : phone}
              onChange={(value) => {
                if (isEmail) setEmail(value);
                else setPhone(value);
                setDestinationError(null);
              }}
              placeholder={
                isEmail
                  ? content["label.Login_EmailPlaceholder"]
                  : content["label.Login_PhonePlaceholder"]
              }
              error={destinationError ?? undefined}
              disabled={pending}
            />

            {/* Button takes no className, so the wrapper is what keeps it at its
                intrinsic width — the flex column would otherwise stretch it. */}
            <div className="w-fit">
              <Button
                label={content["label.Login_Send"]}
                onClick={() => void send()}
                disabled={pending}
              />
            </div>
          </form>
        )}

        {step === "verify" && (
          <form className="flex flex-col gap-m" onSubmit={swallowSubmit}>
            <p className="text-body-md text-body">
              {content["label.Login_CodeSent"].replace("{destination}", sentTo)}
            </p>

            <Input
              label={content["label.Login_CodeLabel"]}
              value={code}
              onChange={(value) => {
                setCode(value);
                setCodeError(null);
              }}
              placeholder={content["label.Login_CodePlaceholder"]}
              error={codeError ?? undefined}
              disabled={pending}
            />

            {/* All three actions of this step are one group, so they share one
                wrapper, one gap token and one alignment, and all sit at the
                default `large` size — the design shows no size hierarchy
                between them, only the primary/secondary distinction. */}
            <div className="flex flex-wrap items-center gap-s">
              <Button
                label={content["label.Login_Verify"]}
                onClick={() => void verify()}
                disabled={pending}
              />
              {/* Button takes a plain string, so the countdown cannot be its
                  own node — the cooling-down state is a second copy string with
                  a {seconds} placeholder rather than a number glued onto the
                  first one, so a translator can put the count where their
                  language wants it. */}
              <Button
                label={
                  cooldown > 0
                    ? content["label.Login_ResendWait"].replace(
                        "{seconds}",
                        String(cooldown),
                      )
                    : content["label.Login_Resend"]
                }
                variant="secondary"
                onClick={() => void resend()}
                disabled={pending || cooldown > 0}
              />
              <Button
                label={content["label.Login_Back"]}
                variant="secondary"
                onClick={restart}
                disabled={pending}
              />
            </div>
          </form>
        )}

        {step === "done" && (
          <div className="w-fit">
            <Button
              label={content["label.Login_Restart"]}
              variant="secondary"
              onClick={restart}
            />
          </div>
        )}
      </main>
    </div>
  );
}
