const splitSentences = (text) =>
  text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)

const extractActionItems = (text) => {
  const lines = text
    .split(/\n|\.|;|-/)
    .map((item) => item.trim())
    .filter(Boolean)

  const keywords = ['todo', 'task', 'action', 'follow up', 'complete', 'finish', 'assign', 'prepare', 'send', 'review']

  return lines
    .filter((line) => keywords.some((keyword) => line.toLowerCase().includes(keyword)))
    .slice(0, 8)
    .map((line) => ({ text: line }))
}

const generateLocalMeetingSummary = (input) => {
  const sentences = splitSentences(input)
  const summary = sentences.slice(0, 4).join(' ') || 'No detailed notes were provided for this meeting.'
  const actionItems = extractActionItems(input)

  return {
    summary,
    actionItems:
      actionItems.length > 0
        ? actionItems
        : [{ text: 'Review the meeting notes and assign next steps to the team.' }],
  }
}

export { generateLocalMeetingSummary }
