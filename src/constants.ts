export interface AnimalSound {
  name: string;
  url: string;
  icon: string;
  category: 'animal' | 'bird';
}

export const ANIMAL_SOUNDS: AnimalSound[] = [
  // Animals
  { name: "Lion", url: "https://www.google.com/logos/fnbx/animal_sounds/lion.mp3", icon: "🦁", category: 'animal' },
  { name: "Elephant", url: "https://www.google.com/logos/fnbx/animal_sounds/elephant.mp3", icon: "🐘", category: 'animal' },
  { name: "Cat", url: "https://www.google.com/logos/fnbx/animal_sounds/cat.mp3", icon: "🐱", category: 'animal' },
  { name: "Dog", url: "https://www.google.com/logos/fnbx/animal_sounds/dog.mp3", icon: "🐶", category: 'animal' },
  { name: "Cow", url: "https://www.google.com/logos/fnbx/animal_sounds/cow.mp3", icon: "🐮", category: 'animal' },
  { name: "Horse", url: "https://www.google.com/logos/fnbx/animal_sounds/horse.mp3", icon: "🐴", category: 'animal' },
  { name: "Sheep", url: "https://www.google.com/logos/fnbx/animal_sounds/sheep.mp3", icon: "🐑", category: 'animal' },
  { name: "Pig", url: "https://www.google.com/logos/fnbx/animal_sounds/pig.mp3", icon: "🐷", category: 'animal' },
  { name: "Wolf", url: "https://www.google.com/logos/fnbx/animal_sounds/wolf.mp3", icon: "🐺", category: 'animal' },
  { name: "Bear", url: "https://www.google.com/logos/fnbx/animal_sounds/bear.mp3", icon: "🐻", category: 'animal' },
  { name: "Monkey", url: "https://www.google.com/logos/fnbx/animal_sounds/monkey.mp3", icon: "🐒", category: 'animal' },
  { name: "Tiger", url: "https://www.google.com/logos/fnbx/animal_sounds/tiger.mp3", icon: "🐯", category: 'animal' },
  { name: "Gorilla", url: "https://www.google.com/logos/fnbx/animal_sounds/gorilla.mp3", icon: "🦍", category: 'animal' },
  { name: "Zebra", url: "https://www.google.com/logos/fnbx/animal_sounds/zebra.mp3", icon: "🦓", category: 'animal' },
  { name: "Goat", url: "https://www.google.com/logos/fnbx/animal_sounds/goat.mp3", icon: "🐐", category: 'animal' },
  { name: "Donkey", url: "https://www.google.com/logos/fnbx/animal_sounds/donkey.mp3", icon: "🫏", category: 'animal' },
  { name: "Camel", url: "https://www.google.com/logos/fnbx/animal_sounds/camel.mp3", icon: "🐫", category: 'animal' },
  { name: "Hyena", url: "https://www.google.com/logos/fnbx/animal_sounds/hyena.mp3", icon: "🐆", category: 'animal' },
  
  // Birds
  { name: "Rooster", url: "https://www.google.com/logos/fnbx/animal_sounds/rooster.mp3", icon: "🐓", category: 'bird' },
  { name: "Duck", url: "https://www.google.com/logos/fnbx/animal_sounds/duck.mp3", icon: "🦆", category: 'bird' },
  { name: "Owl", url: "https://www.google.com/logos/fnbx/animal_sounds/owl.mp3", icon: "🦉", category: 'bird' },
  { name: "Penguin", url: "https://www.google.com/logos/fnbx/animal_sounds/penguin.mp3", icon: "🐧", category: 'bird' },
  { name: "Eagle", url: "https://www.google.com/logos/fnbx/animal_sounds/bald-eagle.mp3", icon: "🦅", category: 'bird' },
  { name: "Parrot", url: "https://www.google.com/logos/fnbx/animal_sounds/macaw.mp3", icon: "🦜", category: 'bird' },
  { name: "Turkey", url: "https://www.google.com/logos/fnbx/animal_sounds/turkey.mp3", icon: "🦃", category: 'bird' },
  { name: "Peacock", url: "https://www.google.com/logos/fnbx/animal_sounds/peacock.mp3", icon: "🦚", category: 'bird' },
  { name: "Swan", url: "https://www.google.com/logos/fnbx/animal_sounds/swan.mp3", icon: "🦢", category: 'bird' },
  { name: "Pigeon", url: "https://www.google.com/logos/fnbx/animal_sounds/pigeon.mp3", icon: "🐦", category: 'bird' },
  { name: "Crow", url: "https://www.google.com/logos/fnbx/animal_sounds/crow.mp3", icon: "🐦", category: 'bird' },
  { name: "Chicken", url: "https://www.google.com/logos/fnbx/animal_sounds/chicken.mp3", icon: "🐔", category: 'bird' },
  
  // Others (kept as animals for simplicity in category)
  { name: "Snake", url: "https://www.google.com/logos/fnbx/animal_sounds/snake.mp3", icon: "🐍", category: 'animal' },
  { name: "Frog", url: "https://www.google.com/logos/fnbx/animal_sounds/frog.mp3", icon: "🐸", category: 'animal' },
  { name: "Bee", url: "https://www.google.com/logos/fnbx/animal_sounds/honey-bee.mp3", icon: "🐝", category: 'animal' },
  { name: "Cricket", url: "https://www.google.com/logos/fnbx/animal_sounds/cricket.mp3", icon: "🦗", category: 'animal' },
  { name: "Whale", url: "https://www.google.com/logos/fnbx/animal_sounds/humpback-whale.mp3", icon: "🐋", category: 'animal' },
  { name: "Dolphin", url: "https://www.google.com/logos/fnbx/animal_sounds/bottlenose-dolphin.mp3", icon: "🐬", category: 'animal' },
];
