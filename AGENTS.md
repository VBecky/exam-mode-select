<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Progress activity uses one month calendar backed by local study days and exam history; keep it as the single calendar view to avoid duplicate weekly widgets.
- Account identity is owned by Supabase Auth; profiles are read and saved through authenticated server functions so private details stay owner-scoped. Passwords must never be stored in app storage.
- Account deletion uses an authenticated server action with fresh user and password verification; the privileged Auth deletion targets only the verified session owner, never an input ID.
- The public index offers inline phone authentication before mounting the exam experience; the root account provider owns session changes to avoid duplicate listeners.
- Study data retains its existing local format, with active-account switching archiving and restoring each user's data by stable user ID to prevent cross-account mixing.
