# User journeys

User journeys describe the flows that connect features — how a user moves through the app to accomplish a goal. Each journey references features by their `Name` from the [feature inventory](../features.md).

## Journeys

| Journey                                      | Goal                                         | Priority |
|----------------------------------------------|----------------------------------------------|----------|
| [Onboarding](onboarding.md)                  | From first visit to first wish               | 1        |
| [Add a wish](add-a-wish.md)                  | Search and add a book to the wish list       | 2        |
| [Price monitoring loop](price-monitoring.md) | Elect a wish, get notified, act on the alert | 3        |
| [CSV import](csv-import.md)                  | Bulk import wishes from a CSV file           | 4        |
| [Sharing](sharing.md)                        | Create and share a wish list with a visitor  | 5        |

## Conventions

- Each journey is a sequence of **steps**. Each step names the feature involved (using the `Name` from the feature inventory) and describes what the user does and sees.
- **Branches** are alternative paths from a step (e.g. an error state, an optional action).
- **Decision points** are moments where the user chooses between paths.
- Journeys are written from the user's perspective — what they see and do, not implementation details.
