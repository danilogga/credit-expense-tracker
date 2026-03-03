import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  // Geral
  Circle, Star, Heart, Bookmark, Flag, Gear, Clock, Calendar, Bell, Scissors,
  Sun, Moon, Drop, Leaf, Flower, Fire, Lightning,
  // Alimentação & Bebidas
  ForkKnife, Coffee, Wine, Hamburger, Pizza, Cookie, Cake, Bread, BowlFood,
  CookingPot, Carrot, Orange,
  // Transporte
  Car, Bus, Train, Airplane, Motorcycle, Bicycle, GasPump, Boat,
  // Moradia
  House, Buildings, Bed, Couch, Lightbulb, Wrench, PaintBucket, Bathtub,
  // Saúde
  Heartbeat, FirstAid, Pill, Hospital, Stethoscope, Tooth, Bandaids,
  // Lazer
  GameController, MusicNotes, FilmSlate, Ticket, Guitar, Television,
  // Educação
  BookOpen, GraduationCap, Pencil, Student, ChalkboardTeacher,
  // Finanças
  Wallet, CreditCard, Coins, Bank, Receipt, PiggyBank, CurrencyDollar, HandCoins,
  // Compras
  ShoppingCart, ShoppingBag, Gift, Tag, Storefront,
  // Tecnologia
  Laptop, DeviceMobile, Headphones, Camera, Watch, WifiHigh,
  // Viagem
  Suitcase, MapPin, Compass, Tent,
  // Pets & Natureza
  PawPrint, Dog, Tree,
} from "@phosphor-icons/react";

export type PhosphorIconComponent = PhosphorIcon;

export const PHOSPHOR_ICON_MAP: Record<string, PhosphorIcon> = {
  // Geral
  circle: Circle,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  flag: Flag,
  gear: Gear,
  clock: Clock,
  calendar: Calendar,
  bell: Bell,
  scissors: Scissors,
  sun: Sun,
  moon: Moon,
  drop: Drop,
  leaf: Leaf,
  flower: Flower,
  fire: Fire,
  lightning: Lightning,
  // Alimentação & Bebidas
  "fork-knife": ForkKnife,
  coffee: Coffee,
  wine: Wine,
  hamburger: Hamburger,
  pizza: Pizza,
  cookie: Cookie,
  cake: Cake,
  bread: Bread,
  "bowl-food": BowlFood,
  "cooking-pot": CookingPot,
  carrot: Carrot,
  orange: Orange,
  // Transporte
  car: Car,
  bus: Bus,
  train: Train,
  airplane: Airplane,
  motorcycle: Motorcycle,
  bicycle: Bicycle,
  "gas-pump": GasPump,
  boat: Boat,
  // Moradia
  house: House,
  buildings: Buildings,
  bed: Bed,
  couch: Couch,
  lightbulb: Lightbulb,
  wrench: Wrench,
  "paint-bucket": PaintBucket,
  bathtub: Bathtub,
  // Saúde
  heartbeat: Heartbeat,
  "first-aid": FirstAid,
  pill: Pill,
  hospital: Hospital,
  stethoscope: Stethoscope,
  tooth: Tooth,
  bandaids: Bandaids,
  // Lazer
  "game-controller": GameController,
  "music-notes": MusicNotes,
  "film-slate": FilmSlate,
  ticket: Ticket,
  guitar: Guitar,
  television: Television,
  // Educação
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  pencil: Pencil,
  student: Student,
  "chalkboard-teacher": ChalkboardTeacher,
  // Finanças
  wallet: Wallet,
  "credit-card": CreditCard,
  coins: Coins,
  bank: Bank,
  receipt: Receipt,
  "piggy-bank": PiggyBank,
  "currency-dollar": CurrencyDollar,
  "hand-coins": HandCoins,
  // Compras
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  gift: Gift,
  tag: Tag,
  storefront: Storefront,
  // Tecnologia
  laptop: Laptop,
  "device-mobile": DeviceMobile,
  headphones: Headphones,
  camera: Camera,
  watch: Watch,
  "wifi-high": WifiHigh,
  // Viagem
  suitcase: Suitcase,
  "map-pin": MapPin,
  compass: Compass,
  tent: Tent,
  // Pets & Natureza
  "paw-print": PawPrint,
  dog: Dog,
  tree: Tree,
};

export const ICON_GROUPS: { label: string; icons: string[] }[] = [
  {
    label: "Geral",
    icons: ["circle", "star", "heart", "bookmark", "flag", "gear", "clock", "calendar", "bell", "scissors", "sun", "moon", "drop", "leaf", "flower", "fire", "lightning"],
  },
  {
    label: "Alimentação & Bebidas",
    icons: ["fork-knife", "coffee", "wine", "hamburger", "pizza", "cookie", "cake", "bread", "bowl-food", "cooking-pot", "carrot", "orange"],
  },
  {
    label: "Transporte",
    icons: ["car", "bus", "train", "airplane", "motorcycle", "bicycle", "gas-pump", "boat"],
  },
  {
    label: "Moradia",
    icons: ["house", "buildings", "bed", "couch", "lightbulb", "wrench", "paint-bucket", "bathtub"],
  },
  {
    label: "Saúde",
    icons: ["heartbeat", "first-aid", "pill", "hospital", "stethoscope", "tooth", "bandaids"],
  },
  {
    label: "Lazer",
    icons: ["game-controller", "music-notes", "film-slate", "ticket", "guitar", "television"],
  },
  {
    label: "Educação",
    icons: ["book-open", "graduation-cap", "pencil", "student", "chalkboard-teacher"],
  },
  {
    label: "Finanças",
    icons: ["wallet", "credit-card", "coins", "bank", "receipt", "piggy-bank", "currency-dollar", "hand-coins"],
  },
  {
    label: "Compras",
    icons: ["shopping-cart", "shopping-bag", "gift", "tag", "storefront"],
  },
  {
    label: "Tecnologia",
    icons: ["laptop", "device-mobile", "headphones", "camera", "watch", "wifi-high"],
  },
  {
    label: "Viagem",
    icons: ["suitcase", "map-pin", "compass", "tent"],
  },
  {
    label: "Pets & Natureza",
    icons: ["paw-print", "dog", "tree"],
  },
];

export const PHOSPHOR_ICON_NAMES = Object.keys(PHOSPHOR_ICON_MAP);
