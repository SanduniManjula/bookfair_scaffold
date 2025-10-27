# Frontend (Next.js) - Bookfair scaffold
- Run `npm install` and `npm run dev`
- Pages: /register, /login, /map
- The map page fetches available stalls from backend at http://localhost:8080

You’re still trying to run the .env.local file, but it’s not an executable.
It’s just a text file that Next.js automatically reads when you run your frontend.

In PowerShell, type this:

`notepad .env.local`

That will open Notepad.
Then paste this inside the file:

`NEXT_PUBLIC_API_URL=http://localhost:8080`