# TeraJobs portal routes (GitHub Pages)

These routes use the URL hash so they work on GitHub Pages without server-side rewrite configuration.

- Homepage: https://terasynctech.github.io/terajobs/
- Candidate login: https://terasynctech.github.io/terajobs/#/candidate-login
- Candidate registration: https://terasynctech.github.io/terajobs/#/candidate-register
- Employer login: https://terasynctech.github.io/terajobs/#/employer-login
- Employer registration: https://terasynctech.github.io/terajobs/#/employer-register

## Important role approval behavior

New profiles are created with the database default role `candidate`. Employer registration records an employer access request in the auth user's metadata, but does not grant the employer role. This is intentional: the public browser must not be able to promote an account to employer or administrator. An administrator must approve an employer account using a trusted Supabase admin workflow before Employer Login will accept it.

Do not expose the Supabase service-role key in the frontend or GitHub Pages secrets that are embedded into the browser build.
