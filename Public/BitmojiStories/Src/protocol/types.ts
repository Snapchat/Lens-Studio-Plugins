import {
    TransformData,
    Vec2Data,
    PoseData,
    AttachmentRef,
    StoryState,
} from "../model/types";

// Editor -> Lens (commands)

export type Command =
    | { type: "addFrame" }
    | { type: "removeFrame"; frameIndex: number }
    | { type: "selectFrame"; frameIndex: number }
    | { type: "copyFrame"; insertAt: number }
    | { type: "loadFullState"; state: StoryState }
    | {
          type: "updateBackground";
          texture: string;
          pivot: Vec2Data;
          transform: TransformData;
      }
    | {
          type: "addBitmoji";
          transform: TransformData;
          pose: PoseData;
          bitmojiType: number;
      }
    | { type: "removeBitmoji"; bitmojiIndex: number }
    | { type: "selectBitmoji"; bitmojiIndex: number }
    | { type: "updatePose"; pose: PoseData }
    | { type: "updateBitmojiType"; bitmojiType: number }
    | { type: "addBubble"; transform: TransformData; text: string }
    | { type: "removeBubble"; bubbleIndex: number }
    | { type: "selectBubble"; bubbleIndex: number }
    | { type: "updateBubbleText"; text: string }
    | { type: "updateBubbleStyle"; style: number }
    | { type: "updateBubbleTailStyle"; style: number }
    | { type: "updateBubbleAttachments"; attachments: AttachmentRef[] };

// Lens -> Editor (events from canvas interaction)

export type CanvasEvent =
    | { type: "backgroundClicked" }
    | { type: "backgroundPivotChanged"; pivot: Vec2Data }
    | { type: "bitmojiClicked"; bitmojiIndex: number }
    | {
          type: "bitmojiTransformChanged";
          bitmojiIndex: number;
          transform: TransformData;
      }
    | { type: "bubbleClicked"; bubbleIndex: number }
    | {
          type: "bubbleTransformChanged";
          bubbleIndex: number;
          transform: TransformData;
      };
