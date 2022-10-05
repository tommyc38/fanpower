import React from 'react';
import { Frame } from '@fanpower/api-interfaces';
import './frame.scss';
import Grid from '@mui/material/Unstable_Grid2';

type ScoreType = number | '-' | 'strike' | 'spare' | null;

const Score = ({ score }: { score: ScoreType }) => {
  if (typeof score === null || typeof score === 'undefined') return <>''</>;
  const strike = (
    <svg style={{ width: '100%', height: '100%' }}>
      <line x1="1" y1="-1" x2="98%" y2="102%" style={{ stroke: 'black', strokeWidth: '3' }} />
      <line x1="1" y1="102%" x2="100%" y2="-2" style={{ stroke: 'black', strokeWidth: '3' }} />
    </svg>
  );

  const spare = (
    <svg style={{ width: '100%', height: '100%' }}>
      <line x1="1" y1="102%" x2="100%" y2="-2" style={{ stroke: 'black', strokeWidth: '3' }} />
    </svg>
  );

  if (typeof score === 'number') return <>{score}</>;
  if (score === 'strike') return strike;
  if (score === 'spare') return spare;
  if (score === '-') return <>-</>;
  return <>{''}</>;
};

export const FrameCell = ({ frame }: { frame: Frame }) => {
  const { scoreOne, scoreTwo, scoreThree } = frame;
  const [x, y, z] = mapScores(frame);

  const calcTotalScore = () => {
    if (isNumber(frame, 'scoreOne')) {
      let score = 0;
      score += scoreOne ?? 0;
      score += scoreTwo ?? 0;
      score += scoreThree ?? 0;
      return score;
    }
    return '';
  };

  return (
    <Grid className="frameContainer" container spacing={0} margin={0} data-isactive={frame.status === 'open'}>
      <Grid xs={4}>
        <div className="frameScore">
          <Score score={z} />
        </div>
      </Grid>
      <Grid xs={4}>
        <div className="frameScore outline">
          <Score score={y} />
        </div>
      </Grid>
      <Grid xs={4}>
        <div className="frameScore outline">
          <Score score={x} />
        </div>
      </Grid>
      <Grid xs={12}>
        <div className="frameTotalScore">{calcTotalScore()}</div>
      </Grid>
    </Grid>
  );
};

const mapScores = (frame: Frame): ScoreType[] => {
  const { scoreOne, scoreTwo, scoreThree } = frame;
  let x: ScoreType = null,
    y: ScoreType = null,
    z: ScoreType = null;
  if (isNumber(frame, 'scoreThree')) {
    if (frame.frame < 10) {
      if (isStrike(frame)) {
        x = 'strike';
      } else {
        y = scoreOne || '-';
        x = 'spare';
      }
    } else {
      z = isStrike(frame) ? 'strike' : scoreOne || '-';
      y = isStrike(frame) && isStrike(frame, 'scoreTwo') ? 'strike' : isSpare(frame) ? 'spare' : scoreTwo || '-';
      x = isStrike(frame, 'scoreThree') ? 'strike' : scoreThree || '-';
    }
  } else if (isNumber(frame, 'scoreTwo')) {
    if (frame.frame < 10) {
      if (isSpare(frame)) {
        y = scoreOne || '-';
        x = 'spare';
      } else if (isStrike(frame)) {
        x = 'strike';
      } else {
        y = scoreOne || '-';
        x = scoreTwo || '-';
      }
    } else {
      y = isStrike(frame) ? 'strike' : scoreOne || '-';
      x = isStrike(frame) && isStrike(frame, 'scoreTwo') ? 'strike' : isSpare(frame) ? 'spare' : scoreTwo || '-';
    }
    return [x, y, z];
  } else if (isNumber(frame, 'scoreOne')) {
    x = isStrike(frame) ? 'strike' : scoreOne || '-';
    return [x, y, z];
  }
  return [x, y, z];
};

const isNumber = (frame: Frame, frameField: keyof Pick<Frame, 'scoreOne' | 'scoreTwo' | 'scoreThree'>) => {
  return typeof frame[frameField] === 'number';
};

const isSpare = (frame: Frame): boolean => {
  if (typeof frame.scoreOne === 'number' && frame.scoreOne < 10) {
    if (typeof frame.scoreTwo === 'number') {
      if (frame.scoreOne + frame.scoreTwo === 10) {
        return true;
      }
    }
  }
  return false;
};

const isStrike = (
  frame: Frame,
  frameField: keyof Pick<Frame, 'scoreOne' | 'scoreTwo' | 'scoreThree'> = 'scoreOne'
): boolean => {
  return typeof frame[frameField] === 'number' && frame[frameField] === 10;
};
