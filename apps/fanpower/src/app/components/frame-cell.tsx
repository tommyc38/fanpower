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
  let x: ScoreType = null,
    y: ScoreType = null,
    z: ScoreType = null;

  if (frame.frame < 10) {
    if (typeof scoreOne === 'number' && typeof scoreTwo !== 'number') {
      if(scoreOne === 10){
        x = 'strike';
      } else {
        x = scoreOne === 0 ? '-': scoreOne;
      }
    }
    else if (typeof scoreOne === 'number' && typeof scoreTwo === 'number') {
      if(scoreOne === 10){
        x = 'strike';
      } else {
        if (scoreOne + scoreTwo === 10) {
          y = scoreOne === 0 ? '-': scoreOne;
          x = 'spare';
        } else {
          x = scoreTwo === 0 ? '-' : scoreTwo;
          y = scoreOne === 0 ? '-' : scoreOne;
        }
      }
    }
  } else {
    if (typeof scoreOne === 'number' && typeof scoreTwo !== 'number' && typeof scoreThree !== 'number') {
      if (scoreOne === 10) {
        x = 'strike';
      } else {
        x = scoreOne === 0 ? '-' : scoreOne;
      }
    } else if (typeof scoreOne === 'number' && typeof scoreTwo == 'number' && typeof scoreThree !== 'number') {
      if (scoreOne === 10) {
        y = 'strike';
        if (scoreTwo === 10) {
          x = 'strike';
        } else {
          x = scoreTwo === 0 ? '-' : scoreTwo;
        }
      } else {
        if (scoreOne + scoreTwo === 10) {
          y = scoreOne === 0 ? '-': 0;
          x = 'spare';
        }
      }
    } else if (typeof scoreOne === 'number' && typeof scoreTwo == 'number' && typeof scoreThree === 'number') {
      if(scoreOne === 10) {
        z = 'strike';
      } else {
        z = scoreOne === 0 ? '-' : scoreOne;
      }
      if(scoreOne + scoreTwo === 10) {
        y = 'spare'
      } else {
        y = scoreTwo === 0 ? '-' : scoreTwo;
      }
      if (scoreOne === 10 && scoreTwo === 10) {
        y = 'strike';
      }
      if (scoreThree === 10 ) {
        z = 'strike';
      } else {
        z = scoreThree === 0 ? '-' : scoreThree;
      }
    }
  }

  const calcTotalScore = () => {
    if (typeof frame.scoreOne === 'number') {
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
