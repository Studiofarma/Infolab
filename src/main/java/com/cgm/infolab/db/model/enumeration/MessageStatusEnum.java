package com.cgm.infolab.db.model.enumeration;

// Quando si prende la stringa della visibilità dal database è necessario usare il metodo trim(),
// perché il db contiene una stringa di lunghezza fissa per la visibilità e ritornerà spazi per allungare la stringa
// fino alla lunghezza prestabilita.
public enum MessageStatusEnum {
    DELETED, EDITED
}
