export interface AnimalSound {
  name: string;
  url: string;
  icon: string;
  category: 'animal' | 'bird';
}

export const HINDI_MAPPING: Record<string, string> = {
  "sher": "Lion",
  "haathi": "Elephant",
  "billi": "Cat",
  "kutta": "Dog",
  "gaay": "Cow",
  "ghoda": "Horse",
  "bhed": "Sheep",
  "suar": "Pig",
  "bhediya": "Wolf",
  "bandar": "Monkey",
  "baagh": "Tiger",
  "oont": "Camel",
  "saanp": "Snake",
  "mendhak": "Frog",
  "murga": "Rooster",
  "batakh": "Duck",
  "ullu": "Owl",
  "murgi": "Chicken",
  "magarmach": "Crocodile",
  "lomdi": "Fox",
  "khargosh": "Rabbit",
  "chuha": "Mouse",
  "chipkali": "Lizard",
  "saand": "Bull",
  "bhains": "Buffalo",
  "shaturmurg": "Ostrich",
  "koyal": "Cuckoo",
  "maina": "Myna",
  "hans": "Swan",
  "batak": "Duck",
  "titli": "Butterfly",
  "machli": "Fish",
  "kacha": "Turtle",
  "chipkali_2": "Gecko"
};

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
  { name: "Monkey", url: "https://www.google.com/logos/fnbx/animal_sounds/monkey.mp3", icon: "🐒", category: 'animal' },
  { name: "Tiger", url: "https://www.google.com/logos/fnbx/animal_sounds/tiger.mp3", icon: "🐯", category: 'animal' },
  { name: "Gorilla", url: "https://www.google.com/logos/fnbx/animal_sounds/gorilla.mp3", icon: "🦍", category: 'animal' },
  { name: "Zebra", url: "https://www.google.com/logos/fnbx/animal_sounds/zebra.mp3", icon: "🦓", category: 'animal' },
  { name: "Camel", url: "https://www.google.com/logos/fnbx/animal_sounds/camel.mp3", icon: "🐫", category: 'animal' },
  { name: "Hyena", url: "https://www.google.com/logos/fnbx/animal_sounds/hyena.mp3", icon: "🐆", category: 'animal' },
  { name: "Hippo", url: "https://www.google.com/logos/fnbx/animal_sounds/hippo.mp3", icon: "🦛", category: 'animal' },
  { name: "Kangaroo", url: "https://www.google.com/logos/fnbx/animal_sounds/kangaroo.mp3", icon: "🦘", category: 'animal' },
  { name: "Koala", url: "https://www.google.com/logos/fnbx/animal_sounds/koala.mp3", icon: "🐨", category: 'animal' },
  { name: "Rabbit", url: "https://www.google.com/logos/fnbx/animal_sounds/rabbit.mp3", icon: "🐰", category: 'animal' },
  { name: "Mouse", url: "https://www.google.com/logos/fnbx/animal_sounds/mouse.mp3", icon: "🐭", category: 'animal' },
  { name: "Raccoon", url: "https://www.google.com/logos/fnbx/animal_sounds/raccoon.mp3", icon: "🦝", category: 'animal' },
  
  // Birds
  { name: "Rooster", url: "https://www.google.com/logos/fnbx/animal_sounds/rooster.mp3", icon: "🐓", category: 'bird' },
  { name: "Duck", url: "https://www.google.com/logos/fnbx/animal_sounds/duck.mp3", icon: "🦆", category: 'bird' },
  { name: "Owl", url: "https://www.google.com/logos/fnbx/animal_sounds/owl.mp3", icon: "🦉", category: 'bird' },
  { name: "Penguin", url: "https://www.google.com/logos/fnbx/animal_sounds/penguin.mp3", icon: "🐧", category: 'bird' },
  { name: "Turkey", url: "https://www.google.com/logos/fnbx/animal_sounds/turkey.mp3", icon: "🦃", category: 'bird' },
  { name: "Chicken", url: "https://www.google.com/logos/fnbx/animal_sounds/chicken.mp3", icon: "🐔", category: 'bird' },
  { name: "Ostrich", url: "https://www.google.com/logos/fnbx/animal_sounds/ostrich.mp3", icon: "🐦", category: 'bird' },
  
  // Others
  { name: "Snake", url: "https://www.google.com/logos/fnbx/animal_sounds/snake.mp3", icon: "🐍", category: 'animal' },
  { name: "Frog", url: "https://www.google.com/logos/fnbx/animal_sounds/frog.mp3", icon: "🐸", category: 'animal' },
  { name: "Whale", url: "https://www.google.com/logos/fnbx/animal_sounds/humpback_whale.mp3", icon: "🐋", category: 'animal' },
  { name: "Alligator", url: "https://www.google.com/logos/fnbx/animal_sounds/alligator.mp3", icon: "🐊", category: 'animal' },
];
