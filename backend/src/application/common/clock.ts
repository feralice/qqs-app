// Tempo como dependência: casos de uso testáveis sem depender do relógio da máquina.
export type Clock = {
  now(): Date;
};
