# Live Sports Scores

A beautiful, real-time sports scores web app that displays live scores from major sports leagues including NFL, NBA, MLB, NHL, MLS, and top European soccer leagues.

## Features

- **Real-time Updates**: Automatically refreshes scores every 60 seconds
- **Live Game Indicators**: Visual indicators for games currently in progress
- **Multiple Leagues**: Coverage of NFL, NBA, MLB, NHL, MLS, Premier League, La Liga, Bundesliga, Serie A, Ligue 1, and Champions League
- **Responsive Design**: Beautiful UI that works on all device sizes
- **Team Logos**: Displays team logos and records
- **Broadcast Info**: Shows which network is broadcasting each game

## Getting Started

### Installation

```bash
npm install
```

### Running the App

```bash
npm run dev
```

The app will start on `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Technologies Used

- **React**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **ESPN API**: Sports data source

## How It Works

The app fetches scores from ESPN's public API for multiple leagues simultaneously. Games are organized by league and sorted to show:
1. Live games first
2. Upcoming games
3. Completed games

The data refreshes automatically every minute to ensure you always see the latest scores.

## Data Source

This app uses ESPN's public API. No API key is required.
