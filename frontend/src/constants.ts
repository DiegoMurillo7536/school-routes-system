/** User-visible copy shown on the index page. */
export class IndexPageCopy {
  static readonly SYSTEM_NAME = "School Route System";
  static readonly DESCRIPTION =
    "Un sistema para organizar las rutas escolares y mantener informadas a las familias.";
  static readonly PHASES_HEADING = "Cómo se construirá el sistema";
  static readonly PHASES_INTRO =
    "Avanzamos por fases. Cada una suma una parte del sistema para la comunidad escolar.";
  static readonly FOOTER_NOTE =
    "School Route System · Transporte escolar organizado";
}

/** The statuses a phase can have, as shown to visitors. */
export class PhaseStatus {
  static readonly PLANNED = "Planificada";
  static readonly IN_PROGRESS = "En progreso";
  static readonly AVAILABLE = "Disponible";
}

/** One of the values defined in PhaseStatus; any other string is a type error. */
export type PhaseStatusValue = (typeof PhaseStatus)[Exclude<
  keyof typeof PhaseStatus,
  "prototype"
>];

/** The copy and status of each phase listed on the index page, in order. */
export class PhaseCopy {
  static readonly PHASES = [
    {
      title: "Administradores de rutas",
      description: "Registra a las personas que gestionarán las rutas.",
      status: PhaseStatus.PLANNED,
    },
    {
      title: "Estudiantes",
      description: "Registra a los estudiantes que usan las rutas.",
      status: PhaseStatus.PLANNED,
    },
    {
      title: "Padres y acudientes o tutores",
      description:
        "Registra a los padres y acudientes o tutores de cada estudiante.",
      status: PhaseStatus.PLANNED,
    },
    {
      title: "Ejecución de rutas",
      description:
        "Pon en marcha las rutas con los administradores, estudiantes, padres y acudientes o tutores registrados.",
      status: PhaseStatus.PLANNED,
    },
  ] as const;
}

/** Tailwind classes that color the status pill of a phase, one entry per status. */
export class PhaseStatusStyle {
  static readonly CLASSES: Readonly<Record<PhaseStatusValue, string>> = {
    [PhaseStatus.PLANNED]:
      "bg-persian-blue-50 text-persian-blue-700 ring-persian-blue-200",
    [PhaseStatus.IN_PROGRESS]: "bg-amber-50 text-amber-800 ring-amber-200",
    [PhaseStatus.AVAILABLE]: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  };
}
