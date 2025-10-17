Ecclesia PRD
---

### **Product Requirements Document: *Ecclesia: A Community's Story***

**Version:** 1.0
**Date:** October 17, 2025
**Author:** Yaniv & Gemini

### 1.0 Product Overview

#### 1.1 Mission Statement
*Ecclesia: A Community's Story* is a single-player, choice-based narrative game designed for an educational setting. It simulates the growth, struggles, and transformation of a Christian community in late antique Southern Gaul, from its founding in the 1st century to its establishment in the 5th. The game's primary goal is to provide students with an immersive, empathetic understanding of the historical forces—social, political, theological, and cultural—that shaped early Christianity.

#### 1.2 Target Audience
* University and high school students in courses on Late Antiquity, Early Medieval History, Church History, and Roman History.
* Independent learners interested in the period.

#### 1.3 Core Experience & Rationale
The player does not act as a single great leader but as the guiding conscience of a fledgling community. Through a series of narrative events, they make difficult choices with uncertain outcomes. The experience is designed to be one of narrative immersion and strategic compromise, not complex resource management. The 30-40 minute playtime is designed to fit within a single lecture or seminar session, or as a focused homework assignment.

### 2.0 Core Gameplay Loop & Objectives

#### 2.1 The Loop
The game progresses in a simple, repeating loop:
1.  **Event Presentation:** The game presents a scenario card with a narrative and a thematic graphic.
2.  **Player Choice:** The player chooses from 2-3 available options. Each choice has a different risk/reward profile.
3.  **Consequence & Resolution:** An outcome is randomly selected from a pool tied to the player's choice. The community's core stats are updated.
4.  **Time Elapses:** The in-game year advances by a variable amount (6 months to 5 years), the Imperial Status may update, and a new event card is drawn from a deck influenced by the current era.

#### 2.2 Win/Loss Conditions
* **Win Condition:** Reach a target of **500 Members** and witness the construction of the community's basilica (post-313 AD).
* **Loss Condition:** The community's **Cohesion** stat drops to 0, causing it to collapse from internal strife or external pressure.

### 3.0 Key Game Systems & Mechanics

#### 3.1 The Community Dashboard (UI)
The main screen provides an at-a-glance summary of the community's status:
* **👥 Members:** The total number of people in the community. This is the primary score and win-condition metric.
* **🔗 Cohesion:** A scale of 0-100 representing the community's morale, unity, and spiritual health. It is the community's "health bar." Low cohesion can trigger negative events like schisms.
* **📅 Year:** The current year (e.g., 117 AD). This grounds the player in the historical timeline.
* **🏛️ Imperial Status:** A text field describing the Roman Empire's current disposition towards Christians (e.g., "Localized Persecution," "Period of Tolerance," "Imperial Crisis"). This is the primary driver of the event deck's composition.

#### 3.2 The Event System
This is the core of the game. Events are presented as cards drawn from a dynamically changing deck.
* **Structure:** Each card contains a title, a short narrative scenario, and 2-3 choices.
* **Randomized Outcomes:** Each choice leads to a set of possible outcomes (e.g., 60% chance of Outcome A, 40% of Outcome B). This adds replayability and uncertainty, forcing players to weigh risks rather than memorize "correct" answers.
* **Rationale:** Simulates the unpredictable nature of history and the law of unintended consequences.

#### 3.3 Imperial Status System
This system connects the local community's story to the grand narrative of the Roman Empire. The status automatically changes as the game's year crosses historical thresholds.
* **States & Their Effects on the Event Deck:**
    * **Apostolic Era (c. 30-70 AD):** Events focus on initial conversion, relations with Jewish communities, and mission.
    * **Peaceful Coexistence / Localized Persecution (c. 70-249 AD):** Mix of internal growth events and sporadic, local persecution scenarios ("A Neighbor Accuses You").
    * **Empire-Wide Persecution (e.g., Decius, Diocletian):** The deck becomes filled with high-stakes survival events ("The Edict of Sacrifice," "Apostasy in the Ranks").
    * **Imperial Crisis (3rd Century):** Events related to plague, inflation, and barbarian raids become common.
    * **The Great Turning (Constantine, 313+ AD):** Persecution cards are removed. Events about patronage, basilica construction, and doctrinal formalization (councils) appear.
    * **The Fading Empire (5th Century):** Events focus on dealing with barbarian federations (Visigoths), collapsing Roman authority, and the rise of the church as a primary social institution.

#### 3.4 Life Cycle System
This makes the community feel demographically alive.
* **Background Rhythm:** A simple, automatic notification appears every few years, adjusting the **Member** count based on a base rate of births and deaths. This rate is modified by game conditions (plague, famine, peace).
* **Life Event Cards:** Specific scenarios tied to births ("The Difficult Birth") and deaths ("Death of an Elder") that require meaningful choices from the player.

#### 3.5 The Wider Church System
These events connect the player's community to the global Christian network.
* **Emissary Events:** Visitors from other churches (e.g., Rome, Antioch, Carthage) arrive with requests for funds, doctrinal questions, or offers of alliance.
* **Synod Events:** Major, multi-stage events where the player must decide their community's stance on a great theological controversy (Arianism, Donatism, Pelagianism) by sending their bishop to a council. These choices forge alliances and enmities.

#### 3.6 The Cult of Saints System
This system simulates the rise of popular religious practices.
* **Relics & *Translationes*:** Rare events allow for the acquisition of relics, granting powerful, permanent bonuses to **Cohesion** and **Member** growth. A *translatio* (ceremonial transfer) of relics into the basilica is a key late-game reward.
* **Hagiography:** A strategic choice to commission a "saint's life" for a local martyr. The choice of author (rhetorician vs. monk) determines whether the resulting text appeals more to the elite or the common folk, unlocking different types of future events.

#### 3.7 Liturgical Calendar System
This introduces the cyclical rhythm of Christian life.
* **Annual Feasts:** Easter, Epiphany, and local martyrs' days provide small, regular boosts to **Cohesion** or **Members**.
* **Holiday Events:** Scenarios based on the evolving nature of feasts like Christmas, forcing the player to deal with issues of pagan syncretism.

### 4.0 Art, UI, and UX Design

#### 4.1 The Dual-View System
The game's primary visual element is a dynamic camera that shifts perspective to enhance the narrative.
* **Interior View (Default):** A personal, close-up view inside the community's place of worship. Used for internal events (theology, charity, community life). This view visually evolves (see 4.2).
* **Exterior View (Event-Driven):** A wider, contextual view showing the building from the outside, within its Gallo-Roman urban or rural setting.
* **Triggers for View Change:**
    * **External Threats:** Switches to Exterior to emphasize vulnerability during persecution or raid events.
    * **Growth Milestones:** A dramatic camera pull-back and pan to a new building exterior when the community acquires a new property or builds its basilica.

#### 4.2 Visual Progression
The central visual is not static. It is the primary reward for player progress.
* **Stage 1: The House Church (*Domus Ecclesiae*):** A simple room within a Gallo-Roman villa or townhouse.
* **Stage 2: The Titular Church (*Titulus*):** A larger, dedicated property, still discreet but more formal. The interior shows early Christian frescoes.
* **Stage 3: The Basilica:** The grand, public, and final stage, unlocked after Constantine. Shows a full clergy and a vast congregation.

#### 4.3 Event Card Design
* **Layout:** Clear, readable text on a background that resembles papyrus or parchment.
* **Graphic Cues:** Each card features a simple, stylized line-art illustration that immediately communicates the theme of the event (e.g., a Roman fasces for persecution, two figures debating for heresy, a sick person for plague).

#### 4.4 Thematic Aesthetic: Late Antique Southern Gaul
All visual assets will be grounded in the specific regional character of Southern Gaul.
* **Architecture:** Buildings will be made of local stone with terracotta tile roofs. Landmarks like the Arles amphitheater may appear in backgrounds.
* **Environment:** The landscape will feature vineyards, rolling hills, and the Rhône river.
* **Characters:** Figures will have Gallic names and wear provincial Roman clothing.

### 5.0 Game Flow & Pacing (30-40 Minute Target)

* **Act I: The Seed (c. 70-200 AD):** ~10 minutes. Focus on initial growth, secrecy, forming a core identity, and dealing with local suspicions.
* **Act II: The Fire (c. 200-313 AD):** ~15 minutes. The community is larger but faces existential threats from Imperial persecutions and major heresies (Arianism). Survival is key.
* **Act III: The Vineyard (c. 313-450 AD):** ~10 minutes. With Imperial acceptance, the challenges become internal: managing rapid growth, engaging in patronage, participating in councils, and dealing with barbarian federations. The goal is to consolidate gains and build the basilica.
* **Event Pacing:** The game will consist of approximately 20-25 major event choices to ensure completion within the target time. Variable time-skips after each event will ensure the historical timeline is covered.

### 6.0 Example Scenarios

#### Scenario 1: Heresy (Act I)
* **Event: The Gnostic Poet**
* **Graphic:** A figure holding a scroll with a stylized snake (Ouroboros) on it.
* **Text:** "A traveling poet named Marcus is captivating your flock with beautiful hymns describing a secret knowledge (*gnosis*) and a hidden, true God separate from the creator of this flawed world. His dualistic message is elegant and popular."
* **Choices & Outcomes:**
    * **A) Excommunicate him immediately.**
        * **Outcome 1 (70%):** You purge the heresy, losing his followers. (**-15 Members, +10 Cohesion**).
        * **Outcome 2 (30%):** His followers rally around him, creating a rival community. (**-40 Members, -20 Cohesion**).
    * **B) Adopt his hymns but preach against his theology.**
        * **Outcome 1 (50%):** A masterful compromise! You keep the beautiful art while solidifying your doctrine. (**+5 Members, +15 Cohesion**).
        * **Outcome 2 (50%):** The message is confused. His ideas continue to circulate, weakening your community's theological core. (**-15 Cohesion**).

#### Scenario 2: Regional Crisis (Act III)
* **Event: The Bacaudae Uprising**
* **Graphic:** A burning villa in the countryside.
* **Text:** "Gangs of desperate peasants and escaped slaves, the *Bacaudae*, are raiding aristocratic villas outside the city. The landowners demand the church condemn these brigands, but many in your flock were once just as desperate."
* **Choices & Outcomes:**
    * **A) Preach a sermon condemning the lawlessness and upholding Roman order.**
        * **Outcome (100%):** You gain the favor of the local elite, unlocking a "Patronage" event. However, you alienate the poorest members. (**-10 Members, -15 Cohesion**).
    * **B) Organize church-funded relief for all victims of the violence, rich and poor.**
        * **Outcome (100%):** An expensive but righteous path. Your reputation for charity grows. (**+10 Members, -5 Cohesion** due to cost).
    * **C) Quietly shelter families displaced by the fighting, without taking a public side.**
        * **Outcome 1 (80%):** Your charity is seen as true neutrality, earning respect from all sides. (**+10 Cohesion**).
        * **Outcome 2 (20%):** You are accused of harboring rebels, triggering a "Magistrate's Investigation" event.