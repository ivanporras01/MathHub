import {grade6} from './grade6';
import {grade7} from './grade7';
import {prealgebra} from './prealgebra';
import {algebra1} from './algebra1';
import {algebra2} from './algebra2';
import {geometry} from './geometry';
import type {LearningContent} from './types';
export const LEARNING_CONTENT:Record<string,LearningContent>={...grade6,...grade7,...prealgebra,...algebra1,...algebra2,...geometry};
