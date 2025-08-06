# Branch Protection Rules for Main Branch

Copy these settings into GitHub web UI:

## Settings → Branches → Add Rule

**Branch name pattern:** `main`

### Protect matching branches

✅ **Require a pull request before merging**
- Required approving reviews: **0** (since it's just you)
- ❌ Dismiss stale PR reviews when new commits are pushed
- ❌ Require review from code owners
- ❌ Restrict pushes that create files larger than 100MB

✅ **Require status checks to pass before merging**
- ✅ Require branches to be up to date before merging
- **Required status checks:**
  - `test (18.x)`
  - `test (20.x)`

✅ **Require conversation resolution before merging**

❌ **Require signed commits**

❌ **Require linear history**

❌ **Require deployments to succeed before merging**

✅ **Lock branch** (prevents force pushes and deletion)

❌ **Do not allow bypassing the above settings** 
(Keep unchecked so you as admin can bypass if needed)

## Result
This setup will:
- Require CI tests to pass (Node 18.x and 20.x)
- Allow you to merge without PR reviews (since you're the only contributor)
- Prevent accidental force pushes or branch deletion
- Let you bypass rules as admin when needed