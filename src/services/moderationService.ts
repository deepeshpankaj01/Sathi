export function detectCrisis(text: string): boolean {
  if (!text) return false;
  
  const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die', 
    'self harm', 'hurt myself', 'give up on life', 'hopeless', 
    'no reason to live'
  ];

  const lowerText = text.toLowerCase();
  return crisisKeywords.some(keyword => lowerText.includes(keyword));
}

export const CRISIS_RESPONSE = "I'm so sorry you're feeling this way, but please know you are not alone. I am an AI and cannot provide the help you need right now. Please reach out to someone who can help immediately. In India, you can call the Aasra helpline at 9820466726 or the Vandrevala Foundation at 9999 666 555. Please talk to them.";
