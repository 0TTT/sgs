import { Card, CardId } from 'core/cards/card';
import { EquipCard, RideCard, WeaponCard } from 'core/cards/equip_card';
import {
  Character,
  CharacterId,
  CharacterNationality,
} from 'core/characters/character';
import { GameEventIdentifiers } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  PlayerCards,
  PlayerCardsArea,
  PlayerId,
  PlayerInfo,
  PlayerRole,
} from 'core/player/player_props';
import {
  CompulsorySkill,
  DistanceSkill,
  TriggerSkill,
  UseCardSkill,
} from 'core/skills/skill';
import { Languages } from 'translations/languages';

export abstract class Player implements PlayerInfo {
  private hp: number;
  private maxHp: number;
  private dead: boolean;
  protected abstract playerId: PlayerId;
  protected abstract playerName: string;
  protected abstract playerLanguage: Languages;
  protected abstract playerPosition: number;
  protected playerRole: PlayerRole = PlayerRole.Unknown;
  protected nationality: CharacterNationality;
  protected position: number;

  private cardUseHistory: CardId[] = [];
  private playerCharacter: Character;

  constructor(
    protected playerCharacterId: CharacterId,
    protected playerCards?: PlayerCards,
  ) {
    this.playerCards = this.playerCards || {
      [PlayerCardsArea.HandArea]: [],
      [PlayerCardsArea.JudgeArea]: [],
      [PlayerCardsArea.HoldingArea]: [],
      [PlayerCardsArea.EquipArea]: [],
    };

    this.playerCharacter = Sanguosha.getCharacterById(this.playerCharacterId);
    this.hp = this.playerCharacter.MaxHp;
    this.maxHp = this.playerCharacter.MaxHp;
    this.nationality = this.playerCharacter.Nationality;
    this.dead = false;
  }

  private useCardRules(card: Card) {
    if (card.Name === 'slash' || card.Name === 'wine') {
      return (
        this.cardUseHistory.filter(
          cardId => Sanguosha.getCardById(cardId).Name === card.Name,
        ).length < 1
      );
    }

    return true;
  }

  public canUseCard(cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);

    const useCardSkills: UseCardSkill[] = [
      ...(this.playerCharacter.Skills.filter(
        skill => skill instanceof UseCardSkill,
      ) as UseCardSkill[]),
      ...this.playerCards[PlayerCardsArea.EquipArea]
        .map(cardId => Sanguosha.getCardById(cardId))
        .filter(card => card instanceof UseCardSkill)
        .map<UseCardSkill>(card => card.ActualSkill as UseCardSkill),
    ];

    if (useCardSkills.length > 0) {
      for (const skill of useCardSkills) {
        for (const rule of skill.useCardRules(this.cardUseHistory)) {
          if (!rule(card)) {
            return false;
          }
        }
      }
    }

    return this.useCardRules(card);
  }

  public canUseSkill(skillName: string, triggerEvent?: GameEventIdentifiers) {
    const skill = this.Character.Skills.find(skill => skill.Name === skillName);
    return skill !== undefined && skill.isAvailable(this, triggerEvent);
  }

  public resetCardUseHistory() {
    this.cardUseHistory = [];
  }

  public useCard(cardId: CardId) {
    this.cardUseHistory.push(cardId);
  }

  public getCardIds(area?: PlayerCardsArea): CardId[] {
    if (area === undefined) {
      const [handCards, judgeCards, holdingCards, equipCards] = Object.values(
        this.playerCards,
      );
      return [...handCards, ...judgeCards, ...holdingCards, ...equipCards];
    }

    return this.playerCards[area];
  }

  public getCardId(cardId: CardId): CardId | undefined {
    for (const cards of Object.values(this.playerCards)) {
      const targetCard = cards.find(card => card === cardId);
      if (targetCard !== undefined) {
        return targetCard;
      }
    }
  }

  public cardFrom(cardId: CardId): PlayerCardsArea | undefined {
    for (const [area, cards] of Object.entries(this.playerCards)) {
      if (cards.find(card => card === cardId)) {
        return (area as any) as PlayerCardsArea;
      }
    }
  }

  public drawCardIds(...cards: CardId[]) {
    const handCards = this.getCardIds(PlayerCardsArea.HandArea);
    for (const card of cards) {
      handCards.push(card);
    }
  }

  dropCards(...cards: CardId[]): CardId[] {
    const playerCardsAreas = [
      PlayerCardsArea.EquipArea,
      PlayerCardsArea.HandArea,
      PlayerCardsArea.HoldingArea,
      PlayerCardsArea.JudgeArea,
    ];
    let droppedCardIds: CardId[] = [];
    for (const playerCardsArea of playerCardsAreas) {
      const areaCards = this.getCardIds(playerCardsArea);
      for (const card of cards) {
        const index = areaCards.findIndex(areaCard => areaCard === card);
        if (index >= 0) {
          droppedCardIds = droppedCardIds.concat(areaCards.splice(index, 1)[0]);
        }
      }
    }

    return droppedCardIds;
  }

  public equip(equipCard: EquipCard) {
    const currentEquipIndex = this.playerCards[
      PlayerCardsArea.EquipArea
    ].findIndex(
      card =>
        Sanguosha.getCardById<EquipCard>(card).EqupCategory ===
        equipCard.EqupCategory,
    );

    if (currentEquipIndex >= 0) {
      this.playerCards[PlayerCardsArea.EquipArea].splice(currentEquipIndex, 1);
    }

    this.playerCards[PlayerCardsArea.EquipArea].push(equipCard.Id);
  }

  public hasArmored(card: CardId): boolean {
    return this.playerCards[PlayerCardsArea.EquipArea].includes(card);
  }

  public get AttackDistance() {
    let defaultDistance = 1;
    const weapon = this.playerCards[PlayerCardsArea.EquipArea].find(
      card => Sanguosha.getCardById(card) instanceof WeaponCard,
    );
    if (weapon !== undefined) {
      const weaponCard: WeaponCard = Sanguosha.getCardById(weapon);
      defaultDistance += weaponCard.AttackDistance;
    }

    return defaultDistance;
  }

  public getOffenseDistance() {
    return this.getFixedDistance(true);
  }

  public getDefenseDistance() {
    return this.getFixedDistance(false);
  }

  private getFixedDistance(toOthers: boolean) {
    const rides: DistanceSkill[] = this.playerCharacter[
      PlayerCardsArea.EquipArea
    ]
      .filter(cardId => {
        const card = Sanguosha.getCardById(cardId);
        return card instanceof RideCard;
      })
      .map(cardId => Sanguosha.getCardById<RideCard>(cardId).ActualSkill);

    const skills: DistanceSkill[] = this.playerCharacter.Skills.filter(
      skill => skill instanceof DistanceSkill,
    ) as DistanceSkill[];

    let fixedDistance = 0;
    for (const skill of [...rides, ...skills]) {
      if (toOthers) {
        if (skill.Distance < 0) {
          fixedDistance += skill.Distance;
        }
      } else {
        if (skill.Distance > 0) {
          fixedDistance += skill.Distance;
        }
      }
    }

    return fixedDistance;
  }

  public getTriggerSkills() {
    const equipCards = this.playerCards[PlayerCardsArea.EquipArea].map(card =>
      Sanguosha.getCardById(card),
    );
    const skills: (TriggerSkill | CompulsorySkill)[] = [];
    for (const equip of equipCards) {
      if (
        equip.ActualSkill instanceof TriggerSkill ||
        equip.ActualSkill instanceof CompulsorySkill
      ) {
        skills.push(equip.ActualSkill);
      }
    }

    for (const skill of this.playerCharacter.Skills) {
      if (skill instanceof TriggerSkill || skill instanceof CompulsorySkill) {
        skills.push(skill);
      }
    }

    return skills;
  }

  public onDamage(hit: number) {
    this.hp -= hit;
  }

  public onLoseHp(lostHp: number) {
    this.hp -= lostHp;
  }

  public onRecoverHp(recover: number) {
    this.hp += recover;
  }

  public get Hp() {
    return this.hp;
  }

  public get Nationality() {
    return this.nationality;
  }

  public set Nationality(nationality: CharacterNationality) {
    this.nationality = nationality;
  }

  public get MaxHp() {
    return this.maxHp;
  }
  public set MaxHp(maxHp: number) {
    this.maxHp = maxHp;
  }

  public get Role() {
    return this.playerRole;
  }
  public set Role(role: PlayerRole) {
    this.playerRole = role;
  }

  public set CharacterId(characterId: CharacterId) {
    this.playerCharacterId = characterId;
  }
  public get CharacterId() {
    return this.playerCharacterId;
  }

  public get Character() {
    return this.playerCharacter;
  }

  public get Id() {
    return this.playerId;
  }

  public get Name() {
    return this.playerName;
  }

  public get Position() {
    return this.playerPosition;
  }

  public get PlayerLanguage() {
    return this.playerLanguage;
  }

  public set PlayerLanguage(language: Languages) {
    this.playerLanguage = language;
  }

  public get CardUseHistory() {
    return this.cardUseHistory;
  }

  public get Dead() {
    return this.dead;
  }
}
