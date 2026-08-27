/**
 * All learning content for "AI Do's & Don'ts at Work."
 * Kept separate from app.js so copy can be revised without touching logic.
 */

const CONTENT = {
  clusters: [
    {
      id: "bring",
      order: 1,
      title: "Bring",
      dek: "Bring real material — and yourself — to the interaction.",
      accent: "bring",
      completeImage: "bring-complete.webp",
      completePattern: "dot-square-seafoam.webp",
      info: {
        image: "bring-info.webp",
        pattern: "concentric-arcs-blue.webp",
        eyebrow: "Cluster 1 of 3",
        heading: "Bring more than a question",
        body: [
          "An AI tool only works with what you give it. If you skip the context, the attachments, and your own judgment, you get a generic answer to a question it never fully understood.",
          "Before you ask, ask yourself: have I actually briefed this the way I'd brief a colleague? Bringing the real situation — and your own taste and expertise — is what turns a first draft into something usable.",
        ],
        points: [
          "Bring proper, full context — don't assume the tool infers your situation.",
          "Add attachments when they're available — show it what you're actually working with.",
          "Bring your own taste and expertise — the output is a starting point, not a finished decision.",
        ],
      },
      questions: [
        {
          image: "bring-q1.webp",
          pattern: "geometric-marks-powder-blue.webp",
          prompt:
            "You need a client email about a delayed project. You type: “Write an email telling the client we're delayed.” What's missing from this request?",
          options: [
            "Nothing — the AI can infer the right tone and details on its own.",
            "The actual specifics: what caused the delay, the new timeline, and the history with this client.",
            "A request to make the email longer.",
            "A sign-off with your name.",
          ],
          correct: 1,
          corrective:
            "An AI tool can't infer facts it was never given. Without the real cause, the new date, and the relationship context, it can only guess — and a guessed email to a real client is a real risk. Bringing the actual details is what makes the draft usable.",
          success:
            "Right. The tool can only work with what it's handed — the real specifics are what turn a generic draft into a usable one.",
        },
        {
          image: "bring-q2.webp",
          pattern: "ring-cluster-lavender.webp",
          prompt:
            "An AI tool hands you a polished-looking first draft of a proposal. What should you do next?",
          options: [
            "Send it as-is — it already reads well.",
            "Apply your own expertise and judgment before it goes out.",
            "Ask a coworker to redo it from scratch instead.",
            "Ask the AI to make it longer so it looks more thorough.",
          ],
          correct: 1,
          corrective:
            "Polished isn't the same as finished. A confident-sounding draft still reflects only what the tool could guess at — your expertise, your read on this client, your judgment calls are what make it actually fit for purpose.",
          success:
            "Exactly. The output is a starting point — your taste and expertise are what make it a finished, defensible decision.",
        },
      ],
    },
    {
      id: "verify",
      order: 2,
      title: "Verify",
      dek: "Don't extend automatic trust — to the output or your own reaction to it.",
      accent: "verify",
      completeImage: "verify-complete.webp",
      completePattern: "confetti-peach.webp",
      info: {
        image: "verify-info.webp",
        pattern: "dot-matrix-mint.webp",
        eyebrow: "Cluster 2 of 3",
        heading: "Trust, but check",
        body: [
          "AI output is fluent and confident by default — which has nothing to do with whether it's correct. Treat every output like a first draft from a new hire: promising, but unverified until you've checked it.",
          "That includes checking your own reaction. A tool that agrees with you enthusiastically hasn't proven you're right — it's just being agreeable.",
        ],
        points: [
          "Review outputs with a QA mindset — a first draft that needs checking, not a finished deliverable.",
          "Don't expect a perfect one-shot answer — treat the first output as a starting point to iterate on.",
          "Don't fall for the sycophancy trap — a confident, agreeable tone isn't evidence of correctness.",
          "Confirm sources and don't take claims at face value — fluent isn't the same as accurate, especially when there are real consequences.",
        ],
      },
      questions: [
        {
          image: "verify-q1.webp",
          pattern: "corner-lines-sage.webp",
          prompt:
            "You ask an AI tool to check your reasoning on a decision. It responds: “This is an excellent approach!” What should that tell you?",
          options: [
            "Your reasoning must be correct — the AI confirmed it.",
            "Nothing about whether it's correct — an agreeable tone isn't evidence the reasoning is sound.",
            "You should phrase questions more flatteringly next time.",
            "The AI is being sarcastic.",
          ],
          correct: 1,
          corrective:
            "Confidence and agreement are a tone, not a QA process. AI tools are prone to telling you what sounds supportive — that's the sycophancy trap. The enthusiasm tells you nothing about whether the reasoning underneath actually holds up.",
          success:
            "Right. A confident, agreeable answer still needs the same scrutiny as a flat, hedged one.",
        },
        {
          image: "verify-q2.webp",
          pattern: "offset-squares-sage-gray.webp",
          prompt:
            "An AI-drafted report cites a statistic you're about to put in a client presentation. What should you do before it goes in the deck?",
          options: [
            "Include it — if it reads fluently, it's probably accurate.",
            "Trace it to its actual source and confirm it's real and represented correctly.",
            "Reword it so it sounds less like AI wrote it.",
            "Remove all numbers from the presentation to be safe.",
          ],
          correct: 1,
          corrective:
            "Fluent phrasing has no bearing on accuracy — a confidently stated statistic can still be fabricated or misapplied. This is exactly the kind of claim with real consequences, so it needs to be traced back to a real, correctly-represented source before it reaches a client.",
          success:
            "Exactly. Confirming the source is the step that turns a plausible-sounding claim into one you can actually stand behind.",
        },
      ],
    },
    {
      id: "present",
      order: 3,
      title: "Stay Present",
      dek: "Stay the visible, accountable human in the work.",
      accent: "present",
      completeImage: "present-complete.webp",
      completePattern: "geometric-marks-powder-blue.webp",
      info: {
        image: "present-info.webp",
        pattern: "mini-circles-peach.webp",
        eyebrow: "Cluster 3 of 3",
        heading: "Don't disappear behind the tool",
        body: [
          "AI is one input among several — alongside your own experience, your colleagues' judgment, and your relationships. It's not a substitute for weighing those together, and it's not a substitute for you.",
          "That matters most in interpersonal or sensitive moments, where the person on the other end deserves your actual presence, not a delegated one.",
        ],
        points: [
          "Juggle AI input with human input and experience — it's one input among others, not the sole basis for a decision.",
          "Don't let AI communicate for you alone in interpersonal or sensitive moments — that's where your presence matters most.",
          "Give proper accreditation — be transparent about AI involvement where it matters.",
        ],
      },
      questions: [
        {
          image: "present-q1.webp",
          pattern: "diamond-cluster-dusty-rose.webp",
          prompt:
            "An AI tool recommends a course of action based on the data you gave it. A trusted colleague raises a concern from experience the data doesn't capture. What should you do?",
          options: [
            "Follow the AI's recommendation — it's the data-driven answer.",
            "Weigh both the AI's analysis and your colleague's experience before deciding.",
            "Ignore your colleague since the AI already answered the question.",
            "Ask the AI to resolve the disagreement for you.",
          ],
          correct: 1,
          corrective:
            "A data-driven recommendation only accounts for what was in the data. Your colleague's experience is a second, legitimate input the model never had access to — the decision needs both, not an automatic tiebreak toward whichever one sounds more analytical.",
          success:
            "Right. AI input is one input among others — the call is still yours to weigh, not the model's to settle.",
        },
        {
          image: "present-q2.webp",
          pattern: "dot-matrix-mint.webp",
          prompt:
            "You use AI to draft a difficult, personal message to a direct report about a performance issue. What's the right way to handle sending it?",
          options: [
            "Send the AI's draft directly — it's well-written and saves time.",
            "Rework it in your own voice and deliver it yourself — this conversation needs your presence.",
            "Have the AI send it directly to save you the discomfort.",
            "Forward the AI draft to HR to send instead.",
          ],
          correct: 1,
          corrective:
            "A well-written draft doesn't make the conversation less personal. A performance conversation is exactly the moment where the person deserves your actual presence — not a message that was merely routed through you.",
          success:
            "Exactly. The draft can be a starting point, but a moment like this one still needs to come from you, in your voice.",
        },
      ],
    },
  ],
};

if (typeof module !== "undefined") module.exports = CONTENT;
