import { Card } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { Character } from 'core/characters/character';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { GameCommonRules } from 'core/game/game_rules';
import { PlayerPhase } from 'core/game/stage_processor';
import { PlayerCardsArea } from 'core/player/player_props';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import { CardResponseAction } from './actions/card_response_action';
import { PlayPhaseAction } from './actions/play_phase_action';
import { ResponsiveUseCardAction } from './actions/responsive_card_use_action';
import { SelectAction } from './actions/select_action';
import { SkillUseAction } from './actions/skill_use_action';
import { RoomPresenter, RoomStore } from './room.presenter';
import { CardSelectorDialog } from './ui/dialog/card_selector_dialog/card_selector_dialog';
import { CharacterSelectorDialog } from './ui/dialog/character_selector_dialog/character_selector_dialog';
import { GameOverDialog } from './ui/dialog/game_over_dialog/game_over_dialog';
import { GuanXingDialog } from './ui/dialog/guanxing_dialog/guanxing_dialog';
import { WuGuFengDengDialog } from './ui/dialog/wugufengdeng_dialog/wugufengdeng_dialog';

export class GameClientProcessor {
  constructor(
    private presenter: RoomPresenter,
    private store: RoomStore,
    private translator: ClientTranslationModule,
  ) {}

  private tryToThrowNotReadyException(e: GameEventIdentifiers) {
    if (!this.store.room && e !== GameEventIdentifiers.PlayerEnterEvent) {
      throw new Error('Game client process does not work when client room is not initialized');
    }
  }

  async onHandleIncomingEvent<T extends GameEventIdentifiers>(e: T, content: ServerEventFinder<T>) {
    this.tryToThrowNotReadyException(e);
    switch (e) {
      case GameEventIdentifiers.GameReadyEvent:
        await this.onHandleGameReadyEvent(e as any, content);
        break;
      case GameEventIdentifiers.GameStartEvent:
        await this.onHandleGameStartEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerEnterEvent:
        await this.onHandlePlayerEnterEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerLeaveEvent:
        await this.onHandlePlayerLeaveEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForChoosingCharacterEvent:
        await this.onHandleChoosingCharacterEvent(e as any, content);
        break;
      case GameEventIdentifiers.SyncGameCommonRulesEvent:
        await this.onHandleSyncGameCommonRulesEvent(e as any, content);
        break;
      case GameEventIdentifiers.DrawCardEvent:
        await this.onHandleDrawCardsEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForPlayCardsOrSkillsEvent:
        await this.onHandlePlayCardStage(e as any, content);
        break;
      case GameEventIdentifiers.PhaseChangeEvent:
        this.onHandlePhaseChangeEvent(e as any, content);
        break;
      case GameEventIdentifiers.PhaseStageChangeEvent:
        this.onHandlePhaseStageChangeEvent(e as any, content);
        break;
      case GameEventIdentifiers.LoseSkillEvent:
        await this.onHandleLoseSkillEvent(e as any, content);
        break;
      case GameEventIdentifiers.ObtainSkillEvent:
        await this.onHandleObtainSkillEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardUseEvent:
        await this.onHandleCardUseEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardResponseEvent:
        await this.onHandleCardResponseEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardDropEvent:
        await this.onHandleCardDropEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardDisplayEvent:
        await this.onHandleCardDisplayEvent(e as any, content);
        break;
      case GameEventIdentifiers.ObtainCardEvent:
        await this.onHandelObtainCardEvent(e as any, content);
        break;
      case GameEventIdentifiers.EquipEvent:
        await this.onHandleEquipEvent(e as any, content);
        break;
      case GameEventIdentifiers.DamageEvent:
        await this.onHandleDamageEvent(e as any, content);
        break;
      case GameEventIdentifiers.LoseHpEvent:
        await this.onHandleLoseHpEvent(e as any, content);
        break;
      case GameEventIdentifiers.RecoverEvent:
        await this.onHandleRecoverEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardUseEvent:
        await this.onHandleAskForCardUseEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardResponseEvent:
        await this.onHandleAskForCardResponseEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardDropEvent:
        await this.onHandleAskForCardDropEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardDisplayEvent:
        await this.onHandleAskForCardDisplayEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForSkillUseEvent:
        await this.onHandleAskForSkillUseEvent(e as any, content);
        break;
      case GameEventIdentifiers.SkillUseEvent:
        await this.onHandleSkillUseEvent(e as any, content);
        break;
      case GameEventIdentifiers.MoveCardEvent:
        await this.onHandleMoveCardEvent(e as any, content);
        break;
      case GameEventIdentifiers.JudgeEvent:
        await this.onHandleJudgeEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerTurnOverEvent:
        await this.onHandlePlayerTurnOverEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForPeachEvent:
        await this.onHandleAskForPeachEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForChoosingCardFromPlayerEvent:
        await this.onHandleAskForChoosingCardFromPlayerEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForChoosingCardEvent:
        await this.onHandleAskForChoosingCardEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardLostEvent:
        await this.onHandleCardLoseEvent(e as any, content);
        break;
      case GameEventIdentifiers.AimEvent:
        await this.onHandleAimEvent(e as any, content);
        break;
      case GameEventIdentifiers.CustomGameDialog:
        await this.onHandleCustomDialogEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForPlaceCardsInDileEvent:
        await this.onHandlePlaceCardsInDileEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForContinuouslyChoosingCardEvent:
        await this.onHandleContinuouslyChoosingCard(e as any, content);
        break;
      case GameEventIdentifiers.ContinuouslyChoosingCardFinishEvent:
        await this.onHandleContinuouslyChoosingCardFinish(e as any, content);
        break;
      case GameEventIdentifiers.AskForChoosingOptionsEvent:
        await this.onHandleAskForChoosingOptionsEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForChoosingPlayerEvent:
        await this.onHandleAskForChoosingPlayerEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerDyingEvent:
        await this.onHandlePlayerDyingEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerDiedEvent:
        await this.onHandlePlayerDiedEvent(e as any, content);
        break;
      case GameEventIdentifiers.GameOverEvent:
        await this.onHandleGameOverEvent(e as any, content);
        break;
      default:
        throw new Error(`Unhandled Game event: ${e}`);
    }
  }

  private onHandleAskForCardResponseEvent<T extends GameEventIdentifiers.AskForCardResponseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new CardResponseAction(content.toId, this.store, this.presenter, content);
    this.presenter.isSkillDisabled(
      CardResponseAction.isSkillsOnCardResponseDisabled(new CardMatcher(content.cardMatcher)),
    );

    action.onPlay(this.translator);
  }

  private async onHandleAskForCardDropEvent<T extends GameEventIdentifiers.AskForCardDropEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.createIncomingConversation({
      conversation: content.conversation
        ? content.conversation
        : TranslationPack.translationJsonPatcher('please drop {0} cards', content.cardAmount).extract(),
      translator: this.translator,
    });

    const action = new SelectAction(content.toId, this.store, this.presenter, content);
    const selectedCards = await action.onSelectCard(content.fromArea, content.cardAmount, content.except);

    this.presenter.closeIncomingConversation();
    const event: ClientEventFinder<T> = {
      fromId: content.toId,
      droppedCards: selectedCards,
    };
    this.store.room.broadcast(type, EventPacker.createIdentifierEvent(type, event));
  }

  private async onHandleAskForCardDisplayEvent<T extends GameEventIdentifiers.AskForCardDisplayEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { cardMatcher, cardAmount, toId, conversation } = content;

    this.presenter.createIncomingConversation({
      conversation,
      translator: this.translator,
    });

    const action = new SelectAction(toId, this.store, this.presenter, content, new CardMatcher(cardMatcher));
    const selectedCards = await action.onSelectCard([PlayerCardsArea.HandArea], cardAmount);

    this.presenter.closeIncomingConversation();
    const displayEvent: ClientEventFinder<T> = {
      fromId: toId,
      selectedCards,
    };
    this.store.room.broadcast(type, EventPacker.createIdentifierEvent(type, displayEvent));
  }

  private onHandleAskForCardUseEvent<T extends GameEventIdentifiers.AskForCardUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new ResponsiveUseCardAction(content.toId, this.store, this.presenter, content);
    this.presenter.isSkillDisabled(
      ResponsiveUseCardAction.isSkillsOnResponsiveCardUseDisabled(new CardMatcher(content.cardMatcher)),
    );

    action.onPlay(this.translator);
  }

  private async onHandleCardUseEvent<T extends GameEventIdentifiers.CardUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    await this.store.room.useCard(content);
    this.presenter.showCards(...Card.getActualCards([content.cardId]).map(cardId => Sanguosha.getCardById(cardId)));
    this.presenter.broadcastUIUpdate();
  }

  private onHandleCardResponseEvent<T extends GameEventIdentifiers.CardResponseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.showCards(...Card.getActualCards([content.cardId]).map(cardId => Sanguosha.getCardById(cardId)));
  }
  private onHandleCardDropEvent<T extends GameEventIdentifiers.CardDropEvent>(type: T, content: ServerEventFinder<T>) {
    this.presenter.showCards(...Card.getActualCards(content.cardIds).map(cardId => Sanguosha.getCardById(cardId)));
  }

  private onHandleCardDisplayEvent<T extends GameEventIdentifiers.CardDisplayEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.showCards(...Card.getActualCards(content.displayCards).map(cardId => Sanguosha.getCardById(cardId)));
  }

  // tslint:disable-next-line:no-empty
  private onHandleAimEvent<T extends GameEventIdentifiers.AimEvent>(type: T, content: ServerEventFinder<T>) {}
  private onHandleDrawCardsEvent<T extends GameEventIdentifiers.DrawCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
    // tslint:disable-next-line:no-empty
  ) {}
  private onHandleCustomDialogEvent<T extends GameEventIdentifiers.CustomGameDialog>(
    type: T,
    content: ServerEventFinder<T>,
    // tslint:disable-next-line:no-empty
  ) {}
  private onHandlePlayerDyingEvent<T extends GameEventIdentifiers.PlayerDyingEvent>(
    type: T,
    content: ServerEventFinder<T>,
    // tslint:disable-next-line:no-empty
  ) {}
  private onHandlePlayerDiedEvent<T extends GameEventIdentifiers.PlayerDiedEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { playerId } = content;
    this.store.room.getPlayerById(playerId).bury();
  }

  private onHandelObtainCardEvent<T extends GameEventIdentifiers.ObtainCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { cardIds, toId } = content;
    this.store.room.getPlayerById(toId).obtainCardIds(...cardIds);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleEquipEvent<T extends GameEventIdentifiers.EquipEvent>(type: T, content: ServerEventFinder<T>) {
    const player = this.store.room.getPlayerById(content.fromId);
    player.equip(Sanguosha.getCardById<EquipCard>(content.cardId));
    this.presenter.broadcastUIUpdate();
  }

  private onHandleDamageEvent<T extends GameEventIdentifiers.DamageEvent>(type: T, content: ServerEventFinder<T>) {
    const player = this.store.room.getPlayerById(content.toId);
    player.onDamage(content.damage);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleLoseHpEvent<T extends GameEventIdentifiers.LoseHpEvent>(type: T, content: ServerEventFinder<T>) {
    const player = this.store.room.getPlayerById(content.toId);
    player.onLoseHp(content.lostHp);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleRecoverEvent<T extends GameEventIdentifiers.RecoverEvent>(type: T, content: ServerEventFinder<T>) {
    const player = this.store.room.getPlayerById(content.toId);
    player.onRecoverHp(content.recoveredHp);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleGameStartEvent<T extends GameEventIdentifiers.GameStartEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    content.otherPlayers.forEach(playerInfo => {
      this.store.room.getPlayerById(playerInfo.Id).CharacterId = playerInfo.CharacterId!;
    });
    this.presenter.broadcastUIUpdate();
  }

  private async onHandleGameReadyEvent<T extends GameEventIdentifiers.GameReadyEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    content.playersInfo.forEach(playerInfo => {
      const player = this.store.room.getPlayerById(playerInfo.Id);
      player.Position = playerInfo.Position;
      player.Role = playerInfo.Role!;
    });
    this.store.room.sortPlayers();
    this.presenter.broadcastUIUpdate();
    await this.store.room.gameStart(content.gameStartInfo);
  }

  private onHandlePlayerEnterEvent<T extends GameEventIdentifiers.PlayerEnterEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    Precondition.assert(this.store.clientRoomInfo !== undefined, 'Uninitialized Client room info');

    if (
      content.joiningPlayerName === this.store.clientRoomInfo.playerName &&
      content.timestamp === this.store.clientRoomInfo.timestamp
    ) {
      this.presenter.setupClientPlayerId(content.joiningPlayerId);
      this.presenter.createClientRoom(
        this.store.clientRoomInfo.roomId,
        this.store.clientRoomInfo.socket,
        content.gameInfo,
        content.playersInfo,
      );
      this.translator.setupPlayer(this.presenter.ClientPlayer);
    } else {
      const playerInfo = Precondition.exists(
        content.playersInfo.find(playerInfo => playerInfo.Id === content.joiningPlayerId),
        `Unknown player ${content.joiningPlayerName}`,
      );

      this.presenter.playerEnter(playerInfo);
    }
  }

  private onHandlePlayerLeaveEvent<T extends GameEventIdentifiers.PlayerLeaveEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.playerLeave(content.playerId);
  }

  private onHandleChoosingCharacterEvent<T extends GameEventIdentifiers.AskForChoosingCharacterEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const onClick = (character: Character) => {
      if (this.presenter.ClientPlayer) {
        this.presenter.ClientPlayer.CharacterId = character.Id;
      }
      this.presenter.closeDialog();
      const response: ClientEventFinder<T> = {
        isGameStart: content.isGameStart,
        chosenCharacter: character.Id,
        fromId: this.store.clientPlayerId,
      };
      this.store.room.broadcast(type, response);
      this.presenter.broadcastUIUpdate();
    };

    this.presenter.createDialog(
      <CharacterSelectorDialog characterIds={content.characterIds} onClick={onClick} translator={this.translator} />,
    );
  }

  private onHandleSyncGameCommonRulesEvent<T extends GameEventIdentifiers.SyncGameCommonRulesEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { commonRules, toId } = content;
    GameCommonRules.syncSocketObject(this.store.room.getPlayerById(toId), commonRules);
  }

  private onHandleAskForSkillUseEvent<T extends GameEventIdentifiers.AskForSkillUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new SkillUseAction(content.toId, this.store, this.presenter, content);
    action.onSelect(this.translator);
  }

  private onHandlePhaseStageChangeEvent<T extends GameEventIdentifiers.PhaseStageChangeEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.CurrentPlayerStage = content.toStage;
  }

  private onHandleLoseSkillEvent<T extends GameEventIdentifiers.LoseSkillEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.toId).loseSkill(content.skillName);
  }

  private onHandleObtainSkillEvent<T extends GameEventIdentifiers.ObtainSkillEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.toId).obtainSkill(content.skillName);
  }

  private onHandlePhaseChangeEvent<T extends GameEventIdentifiers.PhaseChangeEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.onPhaseTo(content.toPlayer, content.to);
    if (content.to === PlayerPhase.PrepareStage) {
      content.fromPlayer && this.presenter.isSkillDisabled(PlayPhaseAction.disableSkills);
      this.store.room.turnTo(content.toPlayer);
      this.presenter.isSkillDisabled(
        PlayPhaseAction.isPlayPhaseSkillsDisabled(this.store.room, this.presenter.ClientPlayer!),
      );

      if (content.fromPlayer) {
        this.store.room.getPlayerById(content.fromPlayer).resetCardUseHistory();

        for (const player of this.store.room.AlivePlayers) {
          for (const skill of player.getSkills()) {
            if (skill.isRefreshAt(content.to)) {
              player.resetSkillUseHistory(skill.Name);
            }
          }
        }
      }
    }
    this.presenter.broadcastUIUpdate();
  }

  private onHandlePlayCardStage<T extends GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new PlayPhaseAction(content.toId, this.store, this.presenter);
    action.onPlay();
  }

  private onHandleMoveCardEvent<T extends GameEventIdentifiers.MoveCardEvent>(type: T, content: ServerEventFinder<T>) {
    for (const cardId of content.cardIds) {
      this.store.room
        .getPlayerById(content.toId)
        .getCardIds(content.toArea)
        .push(cardId);
    }

    this.presenter.broadcastUIUpdate();
  }

  private onHandleJudgeEvent<T extends GameEventIdentifiers.JudgeEvent>(type: T, content: ServerEventFinder<T>) {
    //TODO: add animations here
    this.presenter.broadcastUIUpdate();
  }

  private onHandlePlayerTurnOverEvent<T extends GameEventIdentifiers.PlayerTurnOverEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.toId).turnOver();
    this.presenter.broadcastUIUpdate();
  }

  private async onHandleAskForPeachEvent<T extends GameEventIdentifiers.AskForPeachEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { conversation, fromId } = content;
    this.presenter.createIncomingConversation({
      conversation,
      translator: this.translator,
    });

    const action = new SelectAction(fromId, this.store, this.presenter, content, new CardMatcher({ name: ['peach'] }));
    const peaches = await action.onSelectCard([PlayerCardsArea.HandArea], 1);

    const responseEvent: ClientEventFinder<T> = {
      fromId,
      cardId: peaches[0],
    };

    this.presenter.closeIncomingConversation();
    this.store.room.broadcast(type, responseEvent);
  }

  private onHandleAskForChoosingCardFromPlayerEvent<T extends GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const onSelectedCard = (card: Card | number, fromArea: PlayerCardsArea) => {
      this.presenter.closeDialog();

      const event: ClientEventFinder<T> = {
        fromArea,
        selectedCard: card instanceof Card ? card.Id : undefined,
        selectedCardIndex: card instanceof Card ? undefined : card,
      };
      this.store.room.broadcast(type, event);
    };

    this.presenter.createDialog(
      <CardSelectorDialog options={content.options} onClick={onSelectedCard} translator={this.translator} />,
    );
  }

  private onHandleAskForChoosingCardEvent<T extends GameEventIdentifiers.AskForChoosingCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const onSelectedCard = (card: Card | number) => {
      this.presenter.closeDialog();

      const event: ClientEventFinder<T> = {
        fromId: content.toId,
        selectedCard: card instanceof Card ? card.Id : undefined,
      };
      this.store.room.broadcast(type, event);
    };

    this.presenter.createDialog(
      <CardSelectorDialog options={content.cardIds} onClick={onSelectedCard} translator={this.translator} />,
    );
  }

  private onHandleCardLoseEvent<T extends GameEventIdentifiers.CardLostEvent>(type: T, content: ServerEventFinder<T>) {
    const { fromId, cardIds } = content;

    this.store.room.getPlayerById(fromId).dropCards(...cardIds);

    this.presenter.showCards(
      ...content.cardIds
        .filter(cardId => this.store.room.getCardOwnerId(cardId) === undefined)
        .map(cardId => Sanguosha.getCardById(cardId)),
    );
    this.presenter.broadcastUIUpdate();
  }

  private onHandleAskForChoosingOptionsEvent<T extends GameEventIdentifiers.AskForChoosingOptionsEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { options, conversation, toId } = content;
    const actionHandlers = {};
    options.forEach(option => {
      actionHandlers[option] = () => {
        const response: ClientEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
          fromId: toId,
          selectedOption: option,
        };

        this.store.room.broadcast(GameEventIdentifiers.AskForChoosingOptionsEvent, response);
        this.presenter.disableActionButton('cancel');
      };
    });

    this.presenter.createIncomingConversation({
      optionsActionHanlder: actionHandlers,
      translator: this.translator,
      conversation,
    });

    if (!EventPacker.isUncancellabelEvent(content)) {
      this.presenter.enableActionButton('cancel');
      this.presenter.defineCancelButtonActions(() => {
        const response: ClientEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
          fromId: toId,
        };

        this.store.room.broadcast(GameEventIdentifiers.AskForChoosingOptionsEvent, response);
        this.presenter.disableActionButton('cancel');
        this.presenter.closeIncomingConversation();
      });
    }
  }

  private async onHandleSkillUseEvent<T extends GameEventIdentifiers.SkillUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    await this.store.room.useSkill(content);
    this.presenter.broadcastUIUpdate();
  }

  private async onHandleGameOverEvent<T extends GameEventIdentifiers.GameOverEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { winnerIds, loserIds } = content;
    const winners = winnerIds.map(id => this.store.room.getPlayerById(id));
    const losers = loserIds.map(id => this.store.room.getPlayerById(id));
    this.presenter.createDialog(<GameOverDialog translator={this.translator} winners={winners} losers={losers} />);
  }

  private async onHandleAskForChoosingPlayerEvent<T extends GameEventIdentifiers.AskForChoosingPlayerEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { players, requiredAmount, conversation } = content;
    this.presenter.createIncomingConversation({
      conversation,
      translator: this.translator,
    });
    const action = new SelectAction(content.toId, this.store, this.presenter, content);
    const selectedPlayers = await action.onSelectPlayer(requiredAmount, players);

    const choosePlayerEvent: ClientEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      fromId: content.toId,
      selectedPlayers,
    };

    this.store.room.broadcast(GameEventIdentifiers.AskForChoosingPlayerEvent, choosePlayerEvent);
    this.presenter.closeIncomingConversation();
  }

  private async onHandlePlaceCardsInDileEvent<T extends GameEventIdentifiers.AskForPlaceCardsInDileEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { movableCards, top, bottom, toId, topStackName, bottomStackName } = content;
    const cards = movableCards.map(cardId => Sanguosha.getCardById(cardId));

    const onConfirm = (top: Card[], bottom: Card[]) => () => {
      const responseEvent: ClientEventFinder<T> = {
        top: top.map(card => card.Id),
        bottom: bottom.map(card => card.Id),
        fromId: toId,
      };

      this.presenter.closeDialog();
      this.store.room.broadcast(GameEventIdentifiers.AskForPlaceCardsInDileEvent, responseEvent);
    };

    this.presenter.createDialog(
      <GuanXingDialog
        top={top}
        topStackName={topStackName}
        bottom={bottom}
        bottomStackName={bottomStackName}
        translator={this.translator}
        cards={cards}
        presenter={this.presenter}
        onConfirm={onConfirm}
        title={'guanxing'}
      />,
    );
  }

  private async onHandleContinuouslyChoosingCard<T extends GameEventIdentifiers.AskForContinuouslyChoosingCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    let selected = false;
    const onClick = (card: Card) => {
      if (selected) {
        return;
      }

      selected = true;
      const responseEvent: ClientEventFinder<T> = {
        fromId: this.store.clientPlayerId,
        selectedCard: card.Id,
      };

      this.store.room.broadcast(type, responseEvent);
    };

    this.presenter.createDialog(
      <WuGuFengDengDialog
        cards={content.cardIds}
        selected={content.selected.map(selectedCard => ({
          card: selectedCard.card,
          playerObjectText:
            selectedCard.player &&
            TranslationPack.patchPlayerInTranslation(this.store.room.getPlayerById(selectedCard.player)),
        }))}
        translator={this.translator}
        onClick={this.store.clientPlayerId === content.toId ? onClick : undefined}
      />,
    );
  }

  private async onHandleContinuouslyChoosingCardFinish<
    T extends GameEventIdentifiers.ContinuouslyChoosingCardFinishEvent
  >(type: T, content: ServerEventFinder<T>) {
    this.presenter.closeDialog();
  }
}
