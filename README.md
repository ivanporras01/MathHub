# MathHub by Mr. Porras

An independent MathHub classroom with six courses and 75 original introductory practice topics: 6th Grade Math, 7th Grade Math, Pre-Algebra, Algebra 1, Algebra 2, and Geometry. Algebra 2 has 15 topics; each other course has 12 topics with explanations, illustrations, worked examples, guided steps, fresh numeric practice, hints, and solutions. This is an introductory practice collection, not a complete course or a formal gradebook.

## Student access and progress

New students provide first and last names, their school grade, and school name; email is optional, with a student/parent contact designation. Returning students use the Returning student tab: the same normalized spelling restores the same profile and saved progress across devices. School grade is independent of the selected math course. School/contact fields are returned only to the authenticated professor, never to name-based student sessions. Only the professor can edit these details, including for older profiles. Students under 13 are directed to seek adult help and use a parent/guardian email; this guidance does not verify age or parental consent. Students with identical full names need distinct name variations agreed with Mr. Porras. Sign out on shared devices. These name-based profiles support practice; they do not verify identity.

Mastery requires the Learn and Guided stages plus five independent first-try correct answers. Supported answers still count as correct practice. Activity indicates a recent visible-page heartbeat, not verified attention.

## Linear inequalities lab

Algebra 1 → **Linear inequalities** now covers one-variable comparisons, two-variable half-planes, and systems of two or three constraints. The coordinate lab lets students change the comparison, slope, intercept, and vertical boundaries; build the graph in stages; isolate the overlap; and move a test point with the graph or keyboard controls. Each point is substituted into every inequality with explicit true/false feedback.

Examples include strict/inclusive boundaries, a bounded triangle, an unbounded strip, disjoint regions, and coincident boundaries. A general half-plane solver distinguishes an area, solutions on a boundary, a single point, and an empty set. Teaching explains sign reversal, why above/below requires isolating y, and why a system means AND. Exploration challenges provide explanations; guided and scored practice now also include boundary coordinates, point membership, systems, and integer solutions at a fixed x.

New questions use a versioned negative seed; old unsigned inequality questions retain their exact wording and scoring. Existing topic IDs, progress, class assignments, and teacher access remain intact.

## Custom figures and transformations

The shared Transformations lab in Pre-Algebra and Geometry now starts with a visible coordinate editor. Students can enter one point or a polygon with 3–8 vertices, including signed integers, decimals, and fractions from −50 to 50. **Draw my figure** validates the complete draft before changing the graph. Missing/invalid coordinates, repeated vertices, crossing edges, and polygons with no area receive specific feedback; invalid edits keep the previous figure intact.

Students then choose a reflection, rotation (90°, 180°, or 270° in either direction), translation, or dilation and select **Apply transformation**. Changing the transformation hides the previous image until it is applied again. Original and image vertices appear together on equal-scale axes with a before/after coordinate table, rotation traces, and step-by-step correspondence. Rotations and dilations use the origin. Custom coordinate inputs replace the old whole-figure position sliders, so the original figure matches the entered coordinates exactly. Exploration does not alter scored practice progress.

## Transformation compositions and polynomial studio

Geometry and Pre-Algebra include a composition explorer for reflection in horizontal or vertical lines followed by translation, with an order-reversal comparison. It reproduces the three worksheet examples for P(1, 1), m: y = 2 and n: x = −1. Original, intermediate and final images have distinct colors, line styles, vertex symbols, coordinate labels and a table. Students can edit their point or whole polygon; the existing rotation/dilation explorer remains available.

Algebra 2 adds **Multiplication of polynomials**, including signed binomial and trinomial products, a clickable distributive grid, like-power collection, and guided/scored questions. The same studio expands Algebra 1 polynomial operations, Algebra 2 division, and rational expressions. Division shows leading-term division, multiplication, whole-product subtraction, aligned coefficient rows, zero placeholders, remainders, and synthetic division for monic linear divisors. Custom polynomial inputs accept bounded integer coefficients; custom division outputs can be rounded.

The rational-expression explorer covers multiplication, division, addition and subtraction with factoring, common denominators and all original domain exclusions, including zeros of the divisor. Its examples are original teaching examples of the worksheet's operation types, not a transcription of the photographed handwriting.

Existing topic IDs and order are preserved; the new topic is appended. No existing question generators, database schemas, student records, teacher credentials, or classroom assignments are changed.

## Professor access

Open `/teacher`. Use the private professor access phrase. Capitalization, spaces, and hyphens are ignored. Sessions last eight hours, or 30 days when the personal-device checkbox is selected. Secure HttpOnly cookies, hashed server sessions, expiry, sign-out, rotation, and persistent login limits protect the dashboard. Never commit real credentials or their hashes.

The dashboard provides name/school/contact search, course and activity filters, private school/contact editing, topic progress, help requests, CSV export including school details, a student-link copy button, and student removal with confirmation. Removing a student deletes that profile and its records, leaving other students intact.

The Cloudflare deployment uses the professor phrase and ignores caller-supplied identity headers. The original optional Sites adapter is retained in the source, but this repository has no Sites project identity or shared deployment manifest.

## Classes and assignments

Open `/teacher?tab=classes`, create a named class, and choose its main course. Add registered students from the roster, or share the generated class code. Students can enter the code during registration or in **My assignments** (`/?view=assignments`). Students can belong to several classes. This release keeps one professor account; it does not enable other teachers or school memberships.

Create an assignment for a class with a title, optional instructions/due date, selected topics, and 1–20 independent first-try answers per topic. Students complete Learn, Guided, and the selected practice goal for each topic. Work begins at zero for each assignment, even if a topic was mastered previously. Assignment practice also contributes to lifetime progress. New class members receive the class’s existing assignments.

The assignment report shows each student’s completion percentage, status, attempts/correct answers, help request, and per-topic milestones. CSV export includes assignment progress. Student lists refresh every 15 seconds; teacher reports every 12 seconds. Due dates use the browser’s time zone when entered/displayed and UTC timestamps in storage. Late work stays open and records late completion. Topics and practice goals remain fixed after publication; the title, instructions, and due date can be edited.

Closing an assignment blocks new work but leaves students’ results visible. Archiving a class hides its assignments and disables its join code. Reopening restores access. Removing a student from a class preserves their results; re-enrolling restores progress. Deleting the student profile removes that student’s class membership and assignment records as well.

Schema version 3 adds classes, memberships, assignments, topic milestones, work/completion timestamps, and nullable assignment context on questions/help requests. Migrations preserve existing IDs, sessions, profiles, free-practice questions, progress, and PayPal settings. Teacher endpoints use the existing protected session. Student access requires active enrollment in the class; scoring validates the question’s stored assignment context before accepting an answer, hint, or solution.

## Hosting

This repository is `ivanporras01/MathHub`, with its own `main` branch and history. It is an independent project. Production secrets are configured through Cloudflare, never in source. The Worker is named `mathhub-porras`; its Durable Object namespace and records belong to that Worker. MathPath is not a dependency.

| Resource | MathHub configuration |
| --- | --- |
| GitHub repository | `ivanporras01/MathHub` |
| Production branch | `main` |
| Cloudflare Worker | `mathhub-porras` |
| Cloudflare configuration | `wrangler.cloudflare.json` |
| Classroom identifier | `mr-porras-mathhub-classroom` |
| Student route | `/` |
| Professor route | `/teacher` |

Production: https://mathhub-porras.hectorporras0916.workers.dev/ (professor route `/teacher`). Cloudflare builds and deploys this repository's `main` branch to `mathhub-porras` using `wrangler.cloudflare.json`.

- Build command: `npm run build:cloudflare`
- Deploy command: `npx wrangler deploy --config wrangler.cloudflare.json`
- Student route: `/`
- Professor route: `/teacher`

Cloudflare provisions SQLite Durable Object storage from the configuration. Before classroom use, set the secret `TEACHER_CODE_SHA256` to the SHA-256 of the professor phrase uppercased with spaces and hyphens removed. The normalized phrase must contain 12–64 alphanumeric characters, with total input length at most 64. Use a unique random phrase. Without configuration the dashboard fails closed. `/api/health` reports whether the secret is configured, without disclosing it.

## Voluntary support

`/?view=support` provides an optional PayPal contribution page. The owner-supplied hosted payment link initially offers one-time support at $25 USD. No student information is attached to outbound links. Payment happens on PayPal; the portal does not collect card/bank data or treat a click as a completed payment.

The professor can update or hide payment links in **Support MathHub · PayPal settings**. Monthly giving stays hidden until a separate PayPal Donate/subscription link is configured. One-time hosted links and PayPal.Me links cannot be placed in the monthly field. URL validation permits only supported HTTPS PayPal payment paths, excluding arbitrary hosts and redirects.

Schema version 2 adds nullable school/contact columns and a support-settings table without replacing the existing classroom or student IDs. It seeds the owner-approved PayPal link once; subsequent restarts preserve professor changes. Older cached clients may still create a name-only profile, which the professor can complete later.

## Verification

- `npm run typecheck:cloudflare`
- `node scripts/verify-registration-migration.mjs`
- `node scripts/verify-cloudflare.mjs`
- `node scripts/verify-cloudflare.mjs --sites`
- `node scripts/verify-learning.mjs`
- `node scripts/verify-inequalities.mjs`
- `node scripts/verify-transformations.mjs`
- `npm run build:cloudflare`
- `npx wrangler deploy --config wrangler.cloudflare.json --dry-run --outdir work/worker`
- `node scripts/verify-worker.mjs`

Math checks independently calculate 13,500 questions across all 75 topics. Both server variants are tested for scoring, progress persistence, returning students, authorization, hints, retries, help, removal, session expiry, rate limits, and secure cookies including 30-day sign-in. The standalone Worker bundle is also checked in the Cloudflare SQLite runtime. Test-only credentials in these scripts are public fixtures and must never be used in production. The migration test also exercises version-1 and version-2 records, repeat startup, and unchanged profile/question/progress/session IDs. Shared coursework checks run against both adapters and the actual Worker: enrollment, separate task credit, student/teacher authorization, hints/retries, completion timestamps, help context, archive/reopen behavior, returning students, and removal.

## Content references

The original explanations and generators draw on mathematics domains represented in Florida B.E.S.T. and Common Core. They are independent of DeltaMath and do not claim complete standards coverage.

- https://www.fldoe.org/academics/standards/subject-areas/math-science/mathematics/bestmath.stml
- https://www.thecorestandards.org/Math/Content/6/introduction/
- https://www.thecorestandards.org/Math/Content/7/introduction/
- https://www.thecorestandards.org/Math/Content/8/introduction/


## Operations with Polynomials and graphing studios

The existing `10-division` topic is now titled **Operations with Polynomials**. Its ID and position are unchanged, preserving saved progress and seeded question sequences. Four visible operation buttons lead to ordinary polynomial work and the original 13-problem worksheet, transcribed from the supplied image. The small denominator exponent in problem 3 is ambiguous in the photo, so both 4x² and 4x³ readings are explicitly selectable with complete solutions. Full solutions include factorization, common denominators, sign distribution, complex fractions, domain restrictions, and rejection of the excluded candidate in problem 12. Standalone addition and subtraction lessons are appended after the existing 73 topics, with authored lessons and scored practice.

The rational-expressions lesson now includes the supplied graphing problems 18–20: `6/(x+2)+3`, `(3x+6)/(x−1)`, and `(x²−7x+6)/(x−1)`. It teaches graph construction with asymptotes, intercepts, sample tables, domain and range, and the open circle at `(1,−5)` for problem 20. The radical-equations lesson also includes a square-root/cube-root graphing studio with transformations, point tables, domain/range reasoning, and input checks; the previous equation-solving exploration is retained.

Direct links: `/?topic=10-division`, `/?topic=10-addition`, `/?topic=10-subtraction`, `/?topic=10-multiplication`, `/?topic=10-rational`, and `/?topic=10-radicals`.

## Rational and quadratic graphing

The rational-expressions lesson (`/?topic=10-rational`) now opens a four-part graphing studio: parent functions and variations, a graphing method, worked examples, and interactive practice. The same studio opens in quadratic mode from Algebra 1 quadratic equations and graphs, Algebra 2 function transformations, and completing the square. The existing worksheet and equation-solving labs remain available below it.

Students compare `1/x`, `1/x²`, and `x²` with their transformations, change vertical and horizontal scale/shift parameters, and follow individual parent points to their images. Fifteen rational and seven quadratic examples progress from parents to multiple poles, holes, partial cancellation, slant/polynomial end behavior, completing the square, and exact range proofs. Each example builds the graph in seven steps with tables and a full feature summary. The method tab links to Khan Academy’s English rational-graphing demonstration with a pause-and-predict prompt.

Practice checks asymptotes, intercepts, domain exclusions, holes, range, and applicable end-behavior guides. Students can plot and check their own points before revealing the curve. Feedback is specific to each feature; exploration completion is counted for the current session. These self-checks do not replace the existing Guided and Independent stages that record course progress.

`node scripts/verify-graphing.mjs` independently verifies the 22 examples, 439 range checks, 540 transformation configurations, safe answer parsing, discontinuity rendering, and 47 rendered studio states. The existing advanced-math verification script also runs these checks. `npm run dev` accepts standard preview host/port flags through a small Wrangler adapter.
